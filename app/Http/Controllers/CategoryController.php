<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        try {
            $user = $request->user();

            $categories = Category::where('user_id', $user->id)
                ->orderBy('type')
                ->orderBy('name')
                ->get();

            $now = Carbon::now();

            $categories = $categories->map(function ($category) use ($user, $now) {
                // Find budget for this category
                $budget = Budget::where('user_id', $user->id)
                    ->where('category_id', $category->id)
                    ->first();

                $category->budget = $budget;

                // Calculate spent amount based on budget period or current month
                $spentQuery = Transaction::where('user_id', $user->id)
                    ->where('category_id', $category->id)
                    ->where('type', 'expense');

                if ($budget) {
                    switch ($budget->period) {
                        case 'weekly':
                            $spentQuery->whereBetween('date', [
                                $now->startOfWeek()->toDateString(),
                                $now->endOfWeek()->toDateString(),
                            ]);
                            break;
                        case 'monthly':
                            $spentQuery->whereMonth('date', $now->month)->whereYear('date', $now->year);
                            break;
                        case 'yearly':
                            $spentQuery->whereYear('date', $now->year);
                            break;
                        case 'custom':
                            if ($budget->start_date && $budget->end_date) {
                                $spentQuery->whereBetween('date', [$budget->start_date, $budget->end_date]);
                            }
                            break;
                    }
                } else {
                    $spentQuery->whereMonth('date', $now->month)->whereYear('date', $now->year);
                }

                $spent = $spentQuery->sum('amount');
                $category->total_spent = (float) $spent;

                if ($budget && $budget->amount_limit > 0) {
                    $category->progress = min(round(($spent / $budget->amount_limit) * 100, 1), 100);
                } else {
                    $category->progress = 0;
                }

                return $category;
            });

            // Calculate stats
            $totalBudgeted = 0;
            $totalSpent = 0;
            $exceededCount = 0;

            foreach ($categories as $cat) {
                if ($cat->budget) {
                    $totalBudgeted += (float) $cat->budget->amount_limit;
                    $totalSpent += (float) $cat->total_spent;
                    if ($cat->total_spent > $cat->budget->amount_limit) {
                        $exceededCount++;
                    }
                }
            }

            $stats = [
                'total_income_categories' => $categories->where('type', 'income')->count(),
                'total_expense_categories' => $categories->where('type', 'expense')->count(),
                'total_budgeted' => $totalBudgeted,
                'total_spent' => $totalSpent,
                'total_budget_remaining' => max($totalBudgeted - $totalSpent, 0),
                'exceeded_budgets' => $exceededCount,
            ];

            return Inertia::render('Categories/Index', [
                'categories' => $categories,
                'stats' => $stats,
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading categories: '.$e->getMessage());

            return Inertia::render('Categories/Index', [
                'categories' => [],
                'stats' => [
                    'total_income_categories' => 0,
                    'total_expense_categories' => 0,
                    'total_budgeted' => 0,
                    'total_spent' => 0,
                    'total_budget_remaining' => 0,
                    'exceeded_budgets' => 0,
                ],
                'error' => 'Failed to load categories. Please try again.',
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:income,expense'],
            'icon' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:50'],
            'parent_id' => ['nullable', 'exists:categories,id'],
            'amount_limit' => ['nullable', 'numeric', 'min:0'],
            'period' => ['nullable', 'string', 'in:weekly,monthly,yearly,custom'],
        ]);

        try {
            DB::transaction(function () use ($validated, $request) {
                $user = $request->user();

                $category = Category::create([
                    'user_id' => $user->id,
                    'name' => $validated['name'],
                    'type' => $validated['type'],
                    'icon' => $validated['icon'] ?? null,
                    'color' => $validated['color'] ?? null,
                    'parent_id' => $validated['parent_id'] ?? null,
                ]);

                // Create budget if limit is provided for expense category
                if ($validated['type'] === 'expense' && ! empty($validated['amount_limit'])) {
                    Budget::create([
                        'user_id' => $user->id,
                        'category_id' => $category->id,
                        'name' => $category->name,
                        'amount_limit' => $validated['amount_limit'],
                        'period' => $validated['period'] ?? 'monthly',
                    ]);
                }
            });

            return back()->with('success', 'Kategori dan anggaran berhasil dibuat.');
        } catch (\Exception $e) {
            Log::error('Error creating category: '.$e->getMessage());

            return back()->withErrors(['error' => 'Gagal membuat kategori.']);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category): RedirectResponse
    {
        if ($category->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:income,expense'],
            'icon' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:50'],
            'parent_id' => ['nullable', 'exists:categories,id'],
            'amount_limit' => ['nullable', 'numeric', 'min:0'],
            'period' => ['nullable', 'string', 'in:weekly,monthly,yearly,custom'],
        ]);

        try {
            DB::transaction(function () use ($validated, $category, $request) {
                $category->update([
                    'name' => $validated['name'],
                    'type' => $validated['type'],
                    'icon' => $validated['icon'] ?? null,
                    'color' => $validated['color'] ?? null,
                    'parent_id' => $validated['parent_id'] ?? null,
                ]);

                // Sync budget limit for expense category
                if ($validated['type'] === 'expense') {
                    $budget = Budget::where('category_id', $category->id)->first();

                    if (! empty($validated['amount_limit'])) {
                        if ($budget) {
                            $budget->update([
                                'name' => $category->name,
                                'amount_limit' => $validated['amount_limit'],
                                'period' => $validated['period'] ?? 'monthly',
                            ]);
                        } else {
                            Budget::create([
                                'user_id' => $request->user()->id,
                                'category_id' => $category->id,
                                'name' => $category->name,
                                'amount_limit' => $validated['amount_limit'],
                                'period' => $validated['period'] ?? 'monthly',
                            ]);
                        }
                    } else {
                        // Delete budget if amount limit is cleared
                        if ($budget) {
                            $budget->delete();
                        }
                    }
                } else {
                    // Delete budget if category type is changed to income
                    Budget::where('category_id', $category->id)->delete();
                }
            });

            return back()->with('success', 'Kategori dan anggaran berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Error updating category: '.$e->getMessage());

            return back()->withErrors(['error' => 'Gagal memperbarui kategori.']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Category $category): RedirectResponse
    {
        if ($category->user_id !== $request->user()->id) {
            abort(403);
        }

        try {
            DB::transaction(function () use ($category) {
                // Delete associated budgets
                Budget::where('category_id', $category->id)->delete();

                $category->delete();
            });

            return back()->with('success', 'Kategori dan anggaran berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Error deleting category: '.$e->getMessage());

            return back()->withErrors(['error' => 'Gagal menghapus kategori.']);
        }
    }
}
