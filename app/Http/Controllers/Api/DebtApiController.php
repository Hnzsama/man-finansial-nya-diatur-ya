<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Debt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DebtApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $debts = Debt::where('user_id', $request->user()->id)->get();

            return response()->json($debts);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch debts.'], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:debt,payable,receivable'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        try {
            $debt = DB::transaction(function () use ($validated, $request) {
                return Debt::create([
                    'user_id' => $request->user()->id,
                    'counterparty_name' => $validated['name'],
                    'type' => $validated['type'] === 'debt' ? 'payable' : $validated['type'],
                    'amount' => $validated['amount'],
                    'remaining_amount' => $validated['amount'],
                    'due_date' => $validated['due_date'] ?? null,
                    'notes' => $validated['notes'] ?? null,
                    'status' => 'active',
                ]);
            });

            return response()->json($debt, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create debt: '.$e->getMessage()], 500);
        }
    }

    public function show(Request $request, Debt $debt): JsonResponse
    {
        if ($debt->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($debt);
    }

    public function update(Request $request, Debt $debt): JsonResponse
    {
        if ($debt->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:debt,payable,receivable'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'paid_amount' => ['required', 'numeric', 'min:0'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        try {
            DB::transaction(function () use ($validated, $debt) {
                $remaining = max(0, $validated['amount'] - $validated['paid_amount']);
                $debt->update([
                    'counterparty_name' => $validated['name'],
                    'type' => $validated['type'] === 'debt' ? 'payable' : $validated['type'],
                    'amount' => $validated['amount'],
                    'remaining_amount' => $remaining,
                    'due_date' => $validated['due_date'],
                    'notes' => $validated['notes'],
                    'status' => $remaining <= 0 ? 'paid_off' : 'active',
                ]);
            });

            return response()->json($debt);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update debt: '.$e->getMessage()], 500);
        }
    }

    public function destroy(Request $request, Debt $debt): JsonResponse
    {
        if ($debt->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        try {
            DB::transaction(function () use ($debt) {
                $debt->delete();
            });

            return response()->json(['message' => 'Debt deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete debt.'], 500);
        }
    }
}
