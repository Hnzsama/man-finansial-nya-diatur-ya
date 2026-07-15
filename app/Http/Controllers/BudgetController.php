<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    public function index(Request $request): Response
    {
        try {
            $user = $request->user();

            $budgets = Budget::with('category')
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get();

            $categories = Category::where('user_id', $user->id)
                ->where('type', 'expense')
                ->get();

            // Calculate total spent for each budget
            $budgetsWithSpent = $budgets->map(function ($budget) use ($user) {
                $query = Transaction::where('user_id', $user->id)
                    ->where('type', 'expense');

                if ($budget->category_id) {
                    $query->where('category_id', $budget->category_id);
                }

                $now = Carbon::now();
                switch ($budget->period) {
                    case 'weekly':
                        $query->whereBetween('date', [$now->startOfWeek()->toDateString(), $now->endOfWeek()->toDateString()]);
                        break;
                    case 'monthly':
                        $query->whereMonth('date', $now->month)->whereYear('date', $now->year);
                        break;
                    case 'yearly':
                        $query->whereYear('date', $now->year);
                        break;
                    case 'custom':
                        if ($budget->start_date && $budget->end_date) {
                            $query->whereBetween('date', [$budget->start_date, $budget->end_date]);
                        }
                        break;
                }

                $spent = $query->sum('amount');
                $budget->total_spent = $spent;
                $budget->progress = $budget->amount_limit > 0 ? min(($spent / $budget->amount_limit) * 100, 100) : 0;

                return $budget;
            });

            return Inertia::render('Budgets/Index', [
                'budgets' => $budgetsWithSpent,
                'categories' => $categories,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Budgets/Index', [
                'budgets' => [],
                'categories' => [],
                'error' => 'Failed to load budgets',
            ]);
        }
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'amount_limit' => 'required|numeric|min:0',
            'period' => 'required|in:weekly,monthly,yearly,custom',
            'start_date' => 'nullable|date|required_if:period,custom',
            'end_date' => 'nullable|date|after_or_equal:start_date|required_if:period,custom',
        ]);

        try {
            DB::transaction(function () use ($request, $validated) {
                $budget = new Budget($validated);
                $budget->user_id = $request->user()->id;
                $budget->save();
            });

            return redirect()->route('budgets.index')->with('success', 'Budget created successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to create budget.');
        }
    }

    public function update(Request $request, Budget $budget): RedirectResponse
    {
        if ($budget->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'amount_limit' => 'required|numeric|min:0',
            'period' => 'required|in:weekly,monthly,yearly,custom',
            'start_date' => 'nullable|date|required_if:period,custom',
            'end_date' => 'nullable|date|after_or_equal:start_date|required_if:period,custom',
        ]);

        try {
            DB::transaction(function () use ($budget, $validated) {
                $budget->update($validated);
            });

            return redirect()->route('budgets.index')->with('success', 'Budget updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update budget.');
        }
    }

    public function destroy(Request $request, Budget $budget): RedirectResponse
    {
        if ($budget->user_id !== $request->user()->id) {
            abort(403);
        }

        try {
            DB::transaction(function () use ($budget) {
                $budget->delete();
            });

            return redirect()->route('budgets.index')->with('success', 'Budget deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete budget.');
        }
    }
}
