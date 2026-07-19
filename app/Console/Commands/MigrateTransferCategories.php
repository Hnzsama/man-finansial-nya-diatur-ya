<?php

namespace App\Console\Commands;

use App\Models\Budget;
use App\Models\Category;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\Transfer;
use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('app:migrate-transfer-categories')]
#[Description('Migrates old transfer categories (Transfer Masuk/Keluar) to Transfer Fund and auto-categorizes uncategorized transfer transactions.')]
class MigrateTransferCategories extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        try {
            DB::transaction(function (): void {
                $users = User::all();
                $this->info("Found {$users->count()} users.");

                foreach ($users as $user) {
                    $this->line("Processing user: {$user->email} (ID: {$user->id})");

                    // 1. Ensure "Transfer Fund" categories exist
                    $transferFundExpense = Category::firstOrCreate([
                        'user_id' => $user->id,
                        'name' => 'Transfer Fund',
                        'type' => 'expense',
                    ], [
                        'icon' => 'ArrowsRightLeft',
                        'color' => '#EF4444',
                    ]);

                    $transferFundIncome = Category::firstOrCreate([
                        'user_id' => $user->id,
                        'name' => 'Transfer Fund',
                        'type' => 'income',
                    ], [
                        'icon' => 'ArrowsRightLeft',
                        'color' => '#10B981',
                    ]);

                    // 2. Find old categories
                    $oldExpenseCategories = Category::where('user_id', $user->id)
                        ->where('type', 'expense')
                        ->whereIn(DB::raw('LOWER(name)'), ['transfer keluar', 'transfer out'])
                        ->get();

                    $oldIncomeCategories = Category::where('user_id', $user->id)
                        ->where('type', 'income')
                        ->whereIn(DB::raw('LOWER(name)'), ['transfer masuk', 'transfer in'])
                        ->get();

                    $oldExpenseIds = $oldExpenseCategories->pluck('id')->toArray();
                    $oldIncomeIds = $oldIncomeCategories->pluck('id')->toArray();

                    // 3. Move transactions, budgets, subscriptions from old categories to "Transfer Fund"
                    if (! empty($oldExpenseIds)) {
                        $updatedTx = Transaction::whereIn('category_id', $oldExpenseIds)->update(['category_id' => $transferFundExpense->id]);
                        $updatedBudget = Budget::whereIn('category_id', $oldExpenseIds)->update(['category_id' => $transferFundExpense->id]);
                        $updatedSub = Subscription::whereIn('category_id', $oldExpenseIds)->update(['category_id' => $transferFundExpense->id]);
                        $this->info("  Updated {$updatedTx} expense transactions, {$updatedBudget} budgets, {$updatedSub} subscriptions.");
                    }

                    if (! empty($oldIncomeIds)) {
                        $updatedTx = Transaction::whereIn('category_id', $oldIncomeIds)->update(['category_id' => $transferFundIncome->id]);
                        $updatedBudget = Budget::whereIn('category_id', $oldIncomeIds)->update(['category_id' => $transferFundIncome->id]);
                        $updatedSub = Subscription::whereIn('category_id', $oldIncomeIds)->update(['category_id' => $transferFundIncome->id]);
                        $this->info("  Updated {$updatedTx} income transactions, {$updatedBudget} budgets, {$updatedSub} subscriptions.");
                    }

                    // 4. Fill in uncategorized transfer transactions

                    // A. From the transfers table linking
                    $transfers = Transfer::where('user_id', $user->id)->get();
                    $fixedTransfersExpense = 0;
                    $fixedTransfersIncome = 0;
                    foreach ($transfers as $transfer) {
                        $fixedTransfersExpense += Transaction::where('id', $transfer->expense_transaction_id)
                            ->where('user_id', $user->id)
                            ->whereNull('category_id')
                            ->update(['category_id' => $transferFundExpense->id]);

                        $fixedTransfersIncome += Transaction::where('id', $transfer->income_transaction_id)
                            ->where('user_id', $user->id)
                            ->whereNull('category_id')
                            ->update(['category_id' => $transferFundIncome->id]);
                    }
                    if ($fixedTransfersExpense > 0 || $fixedTransfersIncome > 0) {
                        $this->info("  Fixed from transfers table: {$fixedTransfersExpense} expense, {$fixedTransfersIncome} income transactions.");
                    }

                    // B. From heuristics (is_transfer metadata or notes like "Transfer to/from")
                    $fixedHeuristicsExpense = Transaction::where('user_id', $user->id)
                        ->where('type', 'expense')
                        ->whereNull('category_id')
                        ->where(function ($query) {
                            $query->whereJsonContains('metadata->is_transfer', true)
                                ->orWhere('notes', 'LIKE', 'Transfer to %');
                        })
                        ->update(['category_id' => $transferFundExpense->id]);

                    $fixedHeuristicsIncome = Transaction::where('user_id', $user->id)
                        ->where('type', 'income')
                        ->whereNull('category_id')
                        ->where(function ($query) {
                            $query->whereJsonContains('metadata->is_transfer', true)
                                ->orWhere('notes', 'LIKE', 'Transfer from %');
                        })
                        ->update(['category_id' => $transferFundIncome->id]);

                    if ($fixedHeuristicsExpense > 0 || $fixedHeuristicsIncome > 0) {
                        $this->info("  Fixed from notes/metadata heuristics: {$fixedHeuristicsExpense} expense, {$fixedHeuristicsIncome} income transactions.");
                    }

                    // 5. Delete the old categories
                    if (! empty($oldExpenseIds)) {
                        Category::whereIn('id', $oldExpenseIds)->delete();
                        $this->info('  Deleted old expense categories: '.implode(', ', $oldExpenseCategories->pluck('name')->toArray()));
                    }
                    if (! empty($oldIncomeIds)) {
                        Category::whereIn('id', $oldIncomeIds)->delete();
                        $this->info('  Deleted old income categories: '.implode(', ', $oldIncomeCategories->pluck('name')->toArray()));
                    }
                }
            });

            $this->info('Migration completed successfully!');

            return self::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Migration failed: '.$e->getMessage());

            return self::FAILURE;
        }
    }
}
