<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WalletApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $wallets = Wallet::where('user_id', $request->user()->id)->get();

            return response()->json($wallets);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch wallets.'], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:cash,bank,ewallet,digital'],
            'opening_balance' => ['required', 'numeric'],
            'icon' => ['required', 'string'],
            'color' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        try {
            $wallet = DB::transaction(function () use ($validated, $request) {
                return Wallet::create([
                    'user_id' => $request->user()->id,
                    'name' => $validated['name'],
                    'type' => $validated['type'],
                    'opening_balance' => $validated['opening_balance'],
                    'current_balance' => $validated['opening_balance'],
                    'icon' => $validated['icon'],
                    'color' => $validated['color'],
                    'notes' => $validated['notes'] ?? null,
                ]);
            });

            return response()->json($wallet, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create wallet.'], 500);
        }
    }

    public function show(Request $request, Wallet $wallet): JsonResponse
    {
        if ($wallet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($wallet);
    }

    public function update(Request $request, Wallet $wallet): JsonResponse
    {
        if ($wallet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:cash,bank,ewallet,digital'],
            'icon' => ['required', 'string'],
            'color' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        try {
            DB::transaction(function () use ($validated, $wallet) {
                $wallet->update($validated);
            });

            return response()->json($wallet);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update wallet.'], 500);
        }
    }

    public function destroy(Request $request, Wallet $wallet): JsonResponse
    {
        if ($wallet->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        try {
            DB::transaction(function () use ($wallet) {
                $wallet->delete();
            });

            return response()->json(['message' => 'Wallet deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete wallet.'], 500);
        }
    }
}
