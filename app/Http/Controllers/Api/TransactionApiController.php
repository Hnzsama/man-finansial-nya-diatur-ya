<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
            $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());
            $walletId = $request->input('wallet_id');
            $type = $request->input('type');
            $categoryId = $request->input('category_id');
            $search = $request->input('search');

            $query = Transaction::with(['wallet', 'category'])
                ->where('user_id', $user->id);

            if ($startDate && $startDate !== 'all') {
                $query->whereDate('date', '>=', $startDate);
            }
            if ($endDate && $endDate !== 'all') {
                $query->whereDate('date', '<=', $endDate);
            }
            if ($walletId && $walletId !== 'all') {
                $query->where('wallet_id', $walletId);
            }
            if ($type && $type !== 'all') {
                $query->where('type', $type);
            }
            if ($categoryId && $categoryId !== 'all') {
                $query->where('category_id', $categoryId);
            }
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('notes', 'like', "%{$search}%")
                        ->orWhere('amount', 'like', "%{$search}%")
                        ->orWhereHas('category', function ($qc) use ($search) {
                            $qc->where('name', 'like', "%{$search}%");
                        });
                });
            }

            $transactions = $query->orderBy('date', 'desc')
                ->orderBy('created_at', 'desc')
                ->paginate(50);

            return response()->json($transactions);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to fetch transactions.'], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'wallet_id' => ['required', 'exists:wallets,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $transaction = DB::transaction(function () use ($validated, $request) {
                $wallet = Wallet::where('id', $validated['wallet_id'])
                    ->where('user_id', $request->user()->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $tx = Transaction::create([
                    'user_id' => $request->user()->id,
                    'wallet_id' => $validated['wallet_id'],
                    'category_id' => $validated['category_id'] ?? null,
                    'type' => $validated['type'],
                    'amount' => $validated['amount'],
                    'date' => $validated['date'],
                    'notes' => $validated['notes'] ?? null,
                ]);

                if ($validated['type'] === 'income') {
                    $wallet->current_balance += $validated['amount'];
                } else {
                    $wallet->current_balance -= $validated['amount'];
                }
                $wallet->save();

                return $tx;
            });

            return response()->json($transaction, 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create transaction.'], 500);
        }
    }

    public function show(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json($transaction->load(['wallet', 'category']));
    }

    public function update(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'wallet_id' => ['required', 'exists:wallets,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            DB::transaction(function () use ($validated, $transaction, $request) {
                $oldWallet = Wallet::where('id', $transaction->wallet_id)->lockForUpdate()->firstOrFail();
                $newWallet = $oldWallet->id == $validated['wallet_id']
                    ? $oldWallet
                    : Wallet::where('id', $validated['wallet_id'])->where('user_id', $request->user()->id)->lockForUpdate()->firstOrFail();

                if ($transaction->type === 'income') {
                    $oldWallet->current_balance -= $transaction->amount;
                } else {
                    $oldWallet->current_balance += $transaction->amount;
                }
                $oldWallet->save();

                if ($validated['type'] === 'income') {
                    $newWallet->current_balance += $validated['amount'];
                } else {
                    $newWallet->current_balance -= $validated['amount'];
                }
                $newWallet->save();

                $transaction->update([
                    'wallet_id' => $validated['wallet_id'],
                    'category_id' => $validated['category_id'] ?? null,
                    'type' => $validated['type'],
                    'amount' => $validated['amount'],
                    'date' => $validated['date'],
                    'notes' => $validated['notes'] ?? null,
                ]);
            });

            return response()->json($transaction);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to update transaction.'], 500);
        }
    }

    public function destroy(Request $request, Transaction $transaction): JsonResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        try {
            DB::transaction(function () use ($transaction) {
                $wallet = Wallet::where('id', $transaction->wallet_id)->lockForUpdate()->firstOrFail();

                if ($transaction->type === 'income') {
                    $wallet->current_balance -= $transaction->amount;
                } else {
                    $wallet->current_balance += $transaction->amount;
                }
                $wallet->save();
                $transaction->delete();
            });

            return response()->json(['message' => 'Transaction deleted successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to delete transaction.'], 500);
        }
    }
}
