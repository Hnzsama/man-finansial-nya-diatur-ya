<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CategoryApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $categories = Category::where('user_id', $request->user()->id)->get();

            return response()->json($categories);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch categories.'], 500);
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
            'budget_period' => ['nullable', 'required_with:budget_amount', 'in:monthly,yearly'],
        ]);

        try {
            $category = DB::transaction(function () use ($validated, $request) {
                return Category::create([
                    'user_id' => $request->user()->id,
                    'name' => $validated['name'],
                    'type' => $validated['type'],
                    'icon' => $validated['icon'],
                    'color' => $validated['color'],
                    'parent_id' => $validated['parent_id'] ?? null,
                    'budget_amount' => $validated['budget_amount'] ?? null,
                    'budget_period' => $validated['budget_period'] ?? null,
                ]);
            });

            return response()->json($category, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create category.'], 500);
        }
    }

    public function show(Request $request, Category $category): JsonResponse
    {
        if ($category->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

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
            'budget_period' => ['nullable', 'required_with:budget_amount', 'in:monthly,yearly'],
        ]);

        try {
            DB::transaction(function () use ($validated, $category) {
                $category->update($validated);
            });

            return response()->json($category);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update category.'], 500);
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
