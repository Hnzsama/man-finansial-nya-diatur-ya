<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Goal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GoalApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $goals = Goal::where('user_id', $request->user()->id)->get();

            return response()->json($goals);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch goals.'], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'target_amount' => ['required', 'numeric', 'min:0.01'],
            'current_amount' => ['nullable', 'numeric', 'min:0'],
            'deadline' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'icon' => ['nullable', 'string'],
            'color' => ['nullable', 'string'],
        ]);

        try {
            $goal = DB::transaction(function () use ($validated, $request) {
                return Goal::create([
                    'user_id' => $request->user()->id,
                    'name' => $validated['name'],
                    'target_amount' => $validated['target_amount'],
                    'current_amount' => $validated['current_amount'] ?? 0,
                    'deadline' => $validated['deadline'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'icon' => $validated['icon'] ?? null,
                    'color' => $validated['color'] ?? null,
                ]);
            });

            return response()->json($goal, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create goal.'], 500);
        }
    }

    public function show(Request $request, Goal $goal): JsonResponse
    {
        if ($goal->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($goal);
    }

    public function update(Request $request, Goal $goal): JsonResponse
    {
        if ($goal->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'target_amount' => ['required', 'numeric', 'min:0.01'],
            'current_amount' => ['required', 'numeric', 'min:0'],
            'deadline' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'icon' => ['nullable', 'string'],
            'color' => ['nullable', 'string'],
        ]);

        try {
            DB::transaction(function () use ($validated, $goal) {
                $goal->update($validated);
            });

            return response()->json($goal);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update goal.'], 500);
        }
    }

    public function destroy(Request $request, Goal $goal): JsonResponse
    {
        if ($goal->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        try {
            DB::transaction(function () use ($goal) {
                $goal->delete();
            });

            return response()->json(['message' => 'Goal deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete goal.'], 500);
        }
    }
}
