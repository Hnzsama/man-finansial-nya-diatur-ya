<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\TransactionHistory;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TransactionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        try {
            $user = $request->user();

            // Get filters from request
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
            } else {
                $startDate = null;
            }
            if ($endDate && $endDate !== 'all') {
                $query->whereDate('date', '<=', $endDate);
            } else {
                $endDate = null;
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
                ->paginate(50)
                ->withQueryString();

            $wallets = Wallet::where('user_id', $user->id)->get();
            $categories = Category::where('user_id', $user->id)->get();

            // Calculate quick stats based on filters
            $statsQuery = Transaction::where('user_id', $user->id)->withoutTransfers();
            if ($startDate) {
                $statsQuery->whereDate('date', '>=', $startDate);
            }
            if ($endDate) {
                $statsQuery->whereDate('date', '<=', $endDate);
            }
            if ($walletId && $walletId !== 'all') {
                $statsQuery->where('wallet_id', $walletId);
            }

            // Current selected period stats
            $filteredTransactions = $statsQuery->get();
            $income = $filteredTransactions->where('type', 'income')->sum('amount');
            $expense = $filteredTransactions->where('type', 'expense')->sum('amount');

            // Previous period stats for percentage change
            $lastIncome = 0;
            $lastExpense = 0;

            if ($startDate && $endDate) {
                $start = Carbon::parse($startDate);
                $end = Carbon::parse($endDate);
                $days = $start->diffInDays($end) + 1;

                $lastStartDate = $start->copy()->subDays($days)->toDateString();
                $lastEndDate = $end->copy()->subDays($days)->toDateString();

                $lastPeriodStatsQuery = Transaction::where('user_id', $user->id)
                    ->withoutTransfers()
                    ->whereDate('date', '>=', $lastStartDate)
                    ->whereDate('date', '<=', $lastEndDate);
                if ($walletId && $walletId !== 'all') {
                    $lastPeriodStatsQuery->where('wallet_id', $walletId);
                }

                $lastPeriodTransactions = $lastPeriodStatsQuery->get();
                $lastIncome = $lastPeriodTransactions->where('type', 'income')->sum('amount');
                $lastExpense = $lastPeriodTransactions->where('type', 'expense')->sum('amount');
            }

            $incomeChange = $lastIncome > 0 ? (($income - $lastIncome) / $lastIncome) * 100 : ($income > 0 ? 100 : 0);
            $expenseChange = $lastExpense > 0 ? (($expense - $lastExpense) / $lastExpense) * 100 : ($expense > 0 ? 100 : 0);

            $stats = [
                'total_income' => $income,
                'total_expense' => $expense,
                'net_flow' => $income - $expense,
                'income_change' => round($incomeChange, 1),
                'expense_change' => round($expenseChange, 1),
            ];

            $filters = [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'wallet_id' => $walletId ?? 'all',
                'category_id' => $categoryId ?? 'all',
                'type' => $type ?? 'all',
                'search' => $search ?? '',
            ];

            return Inertia::render('Transactions/Index', [
                'transactions' => $transactions,
                'wallets' => $wallets,
                'categories' => $categories,
                'stats' => $stats,
                'filters' => $filters,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('Transactions/Index', [
                'transactions' => ['data' => [], 'links' => []],
                'wallets' => [],
                'categories' => [],
                'stats' => ['total_income' => 0, 'total_expense' => 0, 'net_flow' => 0],
                'error' => 'Failed to load transactions.',
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'wallet_id' => ['required', 'exists:wallets,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $validated['date'] = Carbon::parse($validated['date'], 'Asia/Jakarta')
            ->setTimeFrom(Carbon::now('Asia/Jakarta'))
            ->utc();

        try {
            DB::transaction(function () use ($validated, $request) {
                $wallet = Wallet::where('id', $validated['wallet_id'])
                    ->where('user_id', $request->user()->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                Transaction::create([
                    'user_id' => $request->user()->id,
                    'wallet_id' => $validated['wallet_id'],
                    'category_id' => $validated['category_id'] ?? null,
                    'type' => $validated['type'],
                    'amount' => $validated['amount'],
                    'date' => $validated['date'],
                    'notes' => $validated['notes'] ?? null,
                ]);

                // Update wallet balance
                if ($validated['type'] === 'income') {
                    $wallet->current_balance += $validated['amount'];
                } else {
                    $wallet->current_balance -= $validated['amount'];
                }

                $wallet->save();
            });

            return back()->with('success', 'Transaction added successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to add transaction.']);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Transaction $transaction): RedirectResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'wallet_id' => ['required', 'exists:wallets,id'],
            'category_id' => ['nullable', 'exists:categories,id'],
            'type' => ['required', 'in:income,expense'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $validated['date'] = Carbon::parse($validated['date'], 'Asia/Jakarta')
            ->setTimeFrom(Carbon::now('Asia/Jakarta'))
            ->utc();

        try {
            DB::transaction(function () use ($validated, $transaction, $request) {
                // Lock the old wallet and the new wallet
                $oldWallet = Wallet::where('id', $transaction->wallet_id)->lockForUpdate()->firstOrFail();
                $newWallet = $oldWallet->id == $validated['wallet_id']
                    ? $oldWallet
                    : Wallet::where('id', $validated['wallet_id'])->where('user_id', $request->user()->id)->lockForUpdate()->firstOrFail();

                // Reverse old transaction effect
                if ($transaction->type === 'income') {
                    $oldWallet->current_balance -= $transaction->amount;
                } else {
                    $oldWallet->current_balance += $transaction->amount;
                }
                $oldWallet->save();

                // Apply new transaction effect
                if ($validated['type'] === 'income') {
                    $newWallet->current_balance += $validated['amount'];
                } else {
                    $newWallet->current_balance -= $validated['amount'];
                }
                $newWallet->save();

                // Log audit history
                $original = $transaction->getOriginal();
                $transaction->fill([
                    'wallet_id' => $validated['wallet_id'],
                    'category_id' => $validated['category_id'] ?? null,
                    'type' => $validated['type'],
                    'amount' => $validated['amount'],
                    'date' => $validated['date'],
                    'notes' => $validated['notes'] ?? null,
                ]);

                $dirty = $transaction->getDirty();
                $transaction->save();

                foreach ($dirty as $field => $newValue) {
                    if (in_array($field, ['wallet_id', 'category_id', 'type', 'amount', 'date', 'notes'])) {
                        $oldValue = $original[$field] ?? null;
                        if ($oldValue != $newValue) {
                            TransactionHistory::create([
                                'transaction_id' => $transaction->id,
                                'user_id' => $request->user()->id,
                                'field_changed' => $field,
                                'old_value' => $oldValue,
                                'new_value' => $newValue,
                            ]);
                        }
                    }
                }
            });

            return back()->with('success', 'Transaction updated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update transaction.']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Transaction $transaction): RedirectResponse
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403);
        }

        try {
            DB::transaction(function () use ($transaction) {
                $wallet = Wallet::where('id', $transaction->wallet_id)->lockForUpdate()->firstOrFail();

                // Reverse the transaction effect
                if ($transaction->type === 'income') {
                    $wallet->current_balance -= $transaction->amount;
                } else {
                    $wallet->current_balance += $transaction->amount;
                }

                $wallet->save();
                $transaction->delete();
            });

            return back()->with('success', 'Transaction deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete transaction.']);
        }
    }
}
