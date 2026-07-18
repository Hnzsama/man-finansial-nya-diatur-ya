<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoryApiController extends Controller
{
    private function loadCategoryBudgetAndSpent(Category $category, $user)
    {
        $now = Carbon::now();
        $budget = Budget::where('user_id', $user->id)
            ->where('category_id', $category->id)
            ->first();

        $category->budget = $budget;
        $category->budget_amount = $budget ? (string) $budget->amount_limit : null;
        $category->budget_period = $budget ? $budget->period : null;

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
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $categories = Category::where('user_id', $user->id)
                ->orderBy('type')
                ->orderBy('name')
                ->get();

            $categories = $categories->map(function ($category) use ($user) {
                return $this->loadCategoryBudgetAndSpent($category, $user);
            });

            return response()->json($categories);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch categories: '.$e->getMessage()], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:income,expense'],
            'icon' => ['required', 'string'],
            'color' => ['required', 'string'],
            'parent_id' => ['nullable', 'exists:categories,id'],
            'budget_amount' => ['nullable', 'numeric', 'min:0'],
            'budget_period' => ['nullable', 'required_with:budget_amount', 'in:weekly,monthly,yearly,custom'],
        ]);

        try {
            $category = DB::transaction(function () use ($validated, $request) {
                $category = Category::create([
                    'user_id' => $request->user()->id,
                    'name' => $validated['name'],
                    'type' => $validated['type'],
                    'icon' => $validated['icon'],
                    'color' => $validated['color'],
                    'parent_id' => $validated['parent_id'] ?? null,
                ]);

                if (! empty($validated['budget_amount'])) {
                    Budget::create([
                        'user_id' => $request->user()->id,
                        'category_id' => $category->id,
                        'name' => $validated['name'].' Budget',
                        'amount_limit' => $validated['budget_amount'],
                        'period' => $validated['budget_period'] ?? 'monthly',
                        'start_date' => now()->startOfMonth(),
                        'end_date' => now()->endOfMonth(),
                    ]);
                }

                return $category;
            });

            $this->loadCategoryBudgetAndSpent($category, $request->user());

            return response()->json($category, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create category: '.$e->getMessage()], 500);
        }
    }

    public function show(Request $request, Category $category): JsonResponse
    {
        if ($category->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $this->loadCategoryBudgetAndSpent($category, $request->user());

        return response()->json($category);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        if ($category->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:income,expense'],
            'icon' => ['required', 'string'],
            'color' => ['required', 'string'],
            'parent_id' => ['nullable', 'exists:categories,id'],
            'budget_amount' => ['nullable', 'numeric', 'min:0'],
            'budget_period' => ['nullable', 'required_with:budget_amount', 'in:weekly,monthly,yearly,custom'],
        ]);

        try {
            DB::transaction(function () use ($validated, $category, $request) {
                $category->update([
                    'name' => $validated['name'],
                    'type' => $validated['type'],
                    'icon' => $validated['icon'],
                    'color' => $validated['color'],
                    'parent_id' => $validated['parent_id'] ?? null,
                ]);

                if (isset($validated['budget_amount'])) {
                    if (empty($validated['budget_amount'])) {
                        Budget::where('category_id', $category->id)->delete();
                    } else {
                        Budget::updateOrCreate([
                            'category_id' => $category->id,
                            'user_id' => $request->user()->id,
                        ], [
                            'name' => $validated['name'].' Budget',
                            'amount_limit' => $validated['budget_amount'],
                            'period' => $validated['budget_period'] ?? 'monthly',
                            'start_date' => now()->startOfMonth(),
                            'end_date' => now()->endOfMonth(),
                        ]);
                    }
                }
            });

            $this->loadCategoryBudgetAndSpent($category, $request->user());

            return response()->json($category);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update category: '.$e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, Category $category): JsonResponse
    {
        if ($category->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        try {
            DB::transaction(function () use ($category) {
                $category->delete();
            });

            return response()->json(['message' => 'Category deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete category.'], 500);
        }
    }
}
