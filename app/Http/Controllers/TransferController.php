<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\Transfer;
use App\Models\Wallet;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TransferController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'from_wallet_id' => ['required', 'exists:wallets,id'],
            'to_wallet_id' => ['required', 'exists:wallets,id', 'different:from_wallet_id'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'date' => ['required', 'date'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            DB::transaction(function () use ($request, $validated) {
                $user = $request->user();
                $amount = (float) $validated['amount'];

                // Lock wallets in alphabetical order of their ID to prevent deadlocks
                $firstId = min($validated['from_wallet_id'], $validated['to_wallet_id']);
                $secondId = max($validated['from_wallet_id'], $validated['to_wallet_id']);

                $wallet1 = Wallet::where('id', $firstId)->where('user_id', $user->id)->lockForUpdate()->firstOrFail();
                $wallet2 = Wallet::where('id', $secondId)->where('user_id', $user->id)->lockForUpdate()->firstOrFail();

                $fromWallet = $wallet1->id == $validated['from_wallet_id'] ? $wallet1 : $wallet2;
                $toWallet = $wallet1->id == $validated['to_wallet_id'] ? $wallet1 : $wallet2;

                $notesText = $validated['notes'] ?? '';
                $expenseNotes = 'Transfer to '.$toWallet->name.($notesText ? " ({$notesText})" : '');
                $incomeNotes = 'Transfer from '.$fromWallet->name.($notesText ? " ({$notesText})" : '');

                // Get or create transfer categories
                $transferOutCategory = Category::firstOrCreate([
                    'user_id' => $user->id,
                    'name' => 'Transfer Keluar',
                    'type' => 'expense',
                ], [
                    'icon' => 'ArrowsRightLeft',
                    'color' => '#EF4444',
                ]);

                $transferInCategory = Category::firstOrCreate([
                    'user_id' => $user->id,
                    'name' => 'Transfer Masuk',
                    'type' => 'income',
                ], [
                    'icon' => 'ArrowsRightLeft',
                    'color' => '#10B981',
                ]);

                // 1. Create Expense Transaction on source wallet
                $expenseTx = Transaction::create([
                    'user_id' => $user->id,
                    'wallet_id' => $fromWallet->id,
                    'category_id' => $transferOutCategory->id,
                    'type' => 'expense',
                    'amount' => $amount,
                    'date' => $validated['date'],
                    'notes' => $expenseNotes,
                ]);

                // 2. Create Income Transaction on destination wallet
                $incomeTx = Transaction::create([
                    'user_id' => $user->id,
                    'wallet_id' => $toWallet->id,
                    'category_id' => $transferInCategory->id,
                    'type' => 'income',
                    'amount' => $amount,
                    'date' => $validated['date'],
                    'notes' => $incomeNotes,
                ]);

                // 3. Create Transfer record linking them
                Transfer::create([
                    'user_id' => $user->id,
                    'from_wallet_id' => $fromWallet->id,
                    'to_wallet_id' => $toWallet->id,
                    'expense_transaction_id' => $expenseTx->id,
                    'income_transaction_id' => $incomeTx->id,
                    'amount' => $amount,
                    'exchange_rate' => 1.0000,
                    'date' => $validated['date'],
                    'notes' => $notesText ?: null,
                ]);

                // 4. Update wallet balances
                $fromWallet->current_balance = (float) $fromWallet->current_balance - $amount;
                $fromWallet->save();

                $toWallet->current_balance = (float) $toWallet->current_balance + $amount;
                $toWallet->save();
            });

            return redirect()->back()->with('success', 'Balance successfully transferred.');
        } catch (\Exception $e) {
            Log::error('Error transferring balance: '.$e->getMessage());

            return redirect()->back()->withErrors(['error' => 'Failed to transfer balance: '.$e->getMessage()]);
        }
    }
}
