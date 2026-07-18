<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Debt;
use App\Models\Transaction;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class DebtController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        try {
            $user = $request->user();

            $debts = Debt::where('user_id', $user->id)
                ->orderBy('due_date', 'asc')
                ->orderBy('created_at', 'desc')
                ->get();

            // Append pay-off progress percentage to each debt
            $debts = $debts->map(function ($debt) {
                $debt->progress = $debt->amount > 0
                    ? min(round((($debt->amount - $debt->remaining_amount) / $debt->amount) * 100, 1), 100)
                    : 0;

                return $debt;
            });

            // Fetch user wallets for payment links
            $wallets = Wallet::where('user_id', $user->id)->get();

            // Calculate overall quick statistics
            $stats = [
                'total_payable' => (float) $debts->where('type', 'payable')->where('status', 'active')->sum('remaining_amount'),
                'total_receivable' => (float) $debts->where('type', 'receivable')->where('status', 'active')->sum('remaining_amount'),
                'total_paid_off' => (float) $debts->whereIn('status', ['active', 'paid_off'])->sum(function ($d) {
                    return $d->amount - $d->remaining_amount;
                }),
                'overdue_debts' => $debts->where('status', 'active')->filter(function ($d) {
                    return $d->due_date && Carbon::parse($d->due_date)->isPast();
                })->count(),
            ];

            return Inertia::render('Debts/Index', [
                'debts' => $debts,
                'stats' => $stats,
                'wallets' => $wallets,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching debts: '.$e->getMessage());

            return Inertia::render('Debts/Index', [
                'debts' => [],
                'stats' => [
                    'total_payable' => 0,
                    'total_receivable' => 0,
                    'total_paid_off' => 0,
                    'overdue_debts' => 0,
                ],
                'wallets' => [],
                'error' => 'Terjadi kesalahan saat memuat data hutang & piutang.',
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:payable,receivable'],
            'counterparty_name' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'wallet_id' => ['nullable', 'exists:wallets,id'],
        ]);

        try {
            DB::transaction(function () use ($request, $validated) {
                $user = $request->user();

                $debt = new Debt;
                $debt->user_id = $user->id;
                $debt->type = $validated['type'];
                $debt->counterparty_name = $validated['counterparty_name'];
                $debt->amount = $validated['amount'];
                $debt->remaining_amount = $validated['amount'];
                $debt->due_date = $validated['due_date'] ?? null;
                $debt->notes = $validated['notes'] ?? null;
                $debt->status = 'active';
                $debt->save();

                // If a wallet is linked, record an initial wallet transaction
                if (! empty($validated['wallet_id'])) {
                    $wallet = Wallet::where('id', $validated['wallet_id'])
                        ->where('user_id', $user->id)
                        ->lockForUpdate()
                        ->firstOrFail();

                    $txType = $validated['type'] === 'payable' ? 'income' : 'expense';
                    $txNotes = ($validated['type'] === 'payable' ? 'Pinjaman dari ' : 'Pinjaman kepada ').$validated['counterparty_name'];

                    $categoryId = null;
                    if ($validated['type'] === 'payable') {
                        $categoryId = Category::firstOrCreate([
                            'user_id' => $user->id,
                            'name' => 'Pinjaman / Hutang',
                            'type' => 'income',
                        ], [
                            'icon' => 'ArrowDownLeft',
                            'color' => '#10B981',
                        ])->id;
                    } else {
                        $categoryId = Category::firstOrCreate([
                            'user_id' => $user->id,
                            'name' => 'Piutang / Pinjaman',
                            'type' => 'expense',
                        ], [
                            'icon' => 'ArrowUpRight',
                            'color' => '#EF4444',
                        ])->id;
                    }

                    Transaction::create([
                        'user_id' => $user->id,
                        'wallet_id' => $wallet->id,
                        'debt_id' => $debt->id,
                        'category_id' => $categoryId,
                        'type' => $txType,
                        'amount' => $validated['amount'],
                        'date' => Carbon::now()->format('Y-m-d'),
                        'notes' => $txNotes,
                    ]);

                    // Adjust wallet balance
                    if ($txType === 'income') {
                        $wallet->current_balance += $validated['amount'];
                    } else {
                        $wallet->current_balance -= $validated['amount'];
                    }
                    $wallet->save();
                }
            });

            return redirect()->back()->with('success', 'Catatan hutang/piutang berhasil ditambahkan.');
        } catch (\Exception $e) {
            Log::error('Error creating debt: '.$e->getMessage());

            return redirect()->back()->withErrors(['error' => 'Gagal menambahkan catatan hutang/piutang.']);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Debt $debt): RedirectResponse
    {
        abort_if($debt->user_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'counterparty_name' => ['required', 'string', 'max:255'],
            'due_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            DB::transaction(function () use ($validated, $debt) {
                $debt->update($validated);
            });

            return redirect()->back()->with('success', 'Catatan hutang/piutang berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Error updating debt: '.$e->getMessage());

            return redirect()->back()->withErrors(['error' => 'Gagal memperbarui catatan hutang/piutang.']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Debt $debt): RedirectResponse
    {
        abort_if($debt->user_id !== $request->user()->id, 403);

        try {
            DB::transaction(function () use ($debt) {
                // Find all transactions associated with this debt
                $transactions = $debt->transactions()->get();

                foreach ($transactions as $transaction) {
                    $wallet = Wallet::where('id', $transaction->wallet_id)->lockForUpdate()->first();
                    if ($wallet) {
                        // Reverse the balance impact of this transaction
                        if ($transaction->type === 'income') {
                            $wallet->current_balance -= $transaction->amount;
                        } else {
                            $wallet->current_balance += $transaction->amount;
                        }
                        $wallet->save();
                    }
                    $transaction->delete();
                }

                $debt->delete();
            });

            return redirect()->back()->with('success', 'Catatan hutang/piutang berhasil dihapus dan saldo dompet telah disesuaikan.');
        } catch (\Exception $e) {
            Log::error('Error deleting debt: '.$e->getMessage());

            return redirect()->back()->withErrors(['error' => 'Gagal menghapus catatan hutang/piutang.']);
        }
    }

    /**
     * Record a payment/installment for a debt.
     */
    public function recordPayment(Request $request, Debt $debt): RedirectResponse
    {
        abort_if($debt->user_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'wallet_id' => ['required', 'exists:wallets,id'],
            'date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            DB::transaction(function () use ($request, $validated, $debt) {
                $user = $request->user();

                // Lock debt record for update
                $lockedDebt = Debt::where('id', $debt->id)->lockForUpdate()->firstOrFail();

                if ($lockedDebt->status === 'paid_off' || $lockedDebt->status === 'cancelled') {
                    throw new \Exception('Hutang/piutang ini sudah lunas atau dibatalkan.');
                }

                // Make sure payment amount does not exceed remaining amount
                $paymentAmount = min($validated['amount'], $lockedDebt->remaining_amount);

                // Lock wallet for update
                $wallet = Wallet::where('id', $validated['wallet_id'])
                    ->where('user_id', $user->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                // repaying a payable = expense, receiving receivable installment = income
                $txType = $lockedDebt->type === 'payable' ? 'expense' : 'income';
                $txNotes = ($lockedDebt->type === 'payable' ? 'Pembayaran hutang kepada ' : 'Penerimaan piutang dari ')
                    .$lockedDebt->counterparty_name
                    .(! empty($validated['notes']) ? ' ('.$validated['notes'].')' : '');

                $categoryId = null;
                if ($lockedDebt->type === 'payable') {
                    $categoryId = Category::firstOrCreate([
                        'user_id' => $user->id,
                        'name' => 'Bayar Hutang',
                        'type' => 'expense',
                    ], [
                        'icon' => 'ArrowUpRight',
                        'color' => '#EF4444',
                    ])->id;
                } else {
                    $categoryId = Category::firstOrCreate([
                        'user_id' => $user->id,
                        'name' => 'Penerimaan Piutang',
                        'type' => 'income',
                    ], [
                        'icon' => 'ArrowDownLeft',
                        'color' => '#10B981',
                    ])->id;
                }

                // Create the Transaction
                Transaction::create([
                    'user_id' => $user->id,
                    'wallet_id' => $wallet->id,
                    'debt_id' => $lockedDebt->id,
                    'category_id' => $categoryId,
                    'type' => $txType,
                    'amount' => $paymentAmount,
                    'date' => $validated['date'],
                    'notes' => $txNotes,
                ]);

                // Update wallet balance
                if ($txType === 'income') {
                    $wallet->current_balance += $paymentAmount;
                } else {
                    $wallet->current_balance -= $paymentAmount;
                }
                $wallet->save();

                // Update debt remaining amount
                $lockedDebt->remaining_amount = max($lockedDebt->remaining_amount - $paymentAmount, 0);
                if ($lockedDebt->remaining_amount <= 0) {
                    $lockedDebt->status = 'paid_off';
                }
                $lockedDebt->save();
            });

            return redirect()->back()->with('success', 'Pembayaran hutang/piutang berhasil dicatat.');
        } catch (\Exception $e) {
            Log::error('Error recording debt payment: '.$e->getMessage());

            return redirect()->back()->withErrors(['error' => 'Gagal mencatat pembayaran hutang/piutang: '.$e->getMessage()]);
        }
    }
}
