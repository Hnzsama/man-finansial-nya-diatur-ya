<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SubscriptionApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $subscriptions = Subscription::where('user_id', $request->user()->id)->get();

            return response()->json($subscriptions);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch subscriptions.'], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'cycle' => ['required', 'in:daily,weekly,monthly,yearly'],
            'next_billing_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'wallet_id' => ['nullable', 'exists:wallets,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
        ]);

        try {
            $subscription = DB::transaction(function () use ($validated, $request) {
                return Subscription::create([
                    'user_id' => $request->user()->id,
                    'name' => $validated['name'],
                    'amount' => $validated['amount'],
                    'cycle' => $validated['cycle'],
                    'next_billing_date' => $validated['next_billing_date'],
                    'notes' => $validated['notes'] ?? null,
                    'wallet_id' => $validated['wallet_id'] ?? null,
                    'category_id' => $validated['category_id'] ?? null,
                    'is_active' => true,
                ]);
            });

            return response()->json($subscription, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create subscription.'], 500);
        }
    }

    public function show(Request $request, Subscription $subscription): JsonResponse
    {
        if ($subscription->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($subscription);
    }

    public function update(Request $request, Subscription $subscription): JsonResponse
    {
        if ($subscription->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'cycle' => ['required', 'in:daily,weekly,monthly,yearly'],
            'next_billing_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'wallet_id' => ['nullable', 'exists:wallets,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'is_active' => ['required', 'boolean'],
        ]);

        try {
            DB::transaction(function () use ($validated, $subscription) {
                $subscription->update($validated);
            });

            return response()->json($subscription);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update subscription.'], 500);
        }
    }

    public function destroy(Request $request, Subscription $subscription): JsonResponse
    {
        if ($subscription->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        try {
            DB::transaction(function () use ($subscription) {
                $subscription->delete();
            });

            return response()->json(['message' => 'Subscription deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete subscription.'], 500);
        }
    }
}
