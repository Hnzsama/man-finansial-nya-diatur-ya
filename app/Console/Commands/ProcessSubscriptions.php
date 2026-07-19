<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\Wallet;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:process';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process active subscriptions due for billing and deduct wallet balance';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $today = Carbon::today()->format('Y-m-d');

        $dueSubscriptions = Subscription::where('is_active', true)
            ->where('next_billing_date', '<=', $today)
            ->get();

        if ($dueSubscriptions->isEmpty()) {
            $this->info('No due subscriptions found to process.');

            return Command::SUCCESS;
        }

        $processedCount = 0;
        $failedCount = 0;

        foreach ($dueSubscriptions as $sub) {
            try {
                DB::transaction(function () use ($sub) {
                    // Lock wallet for update
                    $wallet = Wallet::where('id', $sub->wallet_id)
                        ->where('user_id', $sub->user_id)
                        ->lockForUpdate()
                        ->firstOrFail();

                    $categoryId = $sub->category_id;
                    if (empty($categoryId)) {
                        $categoryId = Category::firstOrCreate([
                            'user_id' => $sub->user_id,
                            'name' => 'Langganan',
                            'type' => 'expense',
                        ], [
                            'icon' => 'Repeat',
                            'color' => '#6366F1',
                        ])->id;
                    }

                    // Create the expense transaction
                    Transaction::create([
                        'user_id' => $sub->user_id,
                        'wallet_id' => $wallet->id,
                        'category_id' => $categoryId,
                        'type' => 'expense',
                        'amount' => $sub->amount,
                        'date' => Carbon::now()->format('Y-m-d'),
                        'notes' => 'Payment for subscription: '.$sub->name.' (Automatic recurring payment)',
                    ]);

                    // Deduct wallet balance
                    $wallet->current_balance = (float) $wallet->current_balance - (float) $sub->amount;
                    $wallet->save();

                    // Calculate next billing date
                    $nextDate = Carbon::parse($sub->next_billing_date);
                    switch ($sub->frequency) {
                        case 'daily':
                            $nextDate->addDay();
                            break;
                        case 'weekly':
                            $nextDate->addWeek();
                            break;
                        case 'monthly':
                            $nextDate->addMonth();
                            break;
                        case 'yearly':
                            $nextDate->addYear();
                            break;
                    }

                    $sub->next_billing_date = $nextDate;
                    $sub->save();
                });

                $formattedAmount = number_format((float) $sub->amount, 2, '.', '');
                $this->info("Successfully processed subscription: {$sub->name} (amount: {$formattedAmount})");
                $processedCount++;
            } catch (\Exception $e) {
                Log::error("Failed to process subscription ID {$sub->id}: ".$e->getMessage());
                $this->error("Failed to process subscription: {$sub->name} - Error: {$e->getMessage()}");
                $failedCount++;
            }
        }

        $this->info("Subscription processing completed. Processed: {$processedCount}, Failed: {$failedCount}.");

        return Command::SUCCESS;
    }
}
