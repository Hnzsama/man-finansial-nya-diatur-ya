<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\Budget;
use App\Models\Category;
use App\Models\Debt;
use App\Models\Goal;
use App\Models\Subscription;
use App\Models\Transaction;
use App\Models\TransactionHistory;
use App\Models\Transfer;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::firstOrCreate([
            'email' => 'test@example.com',
        ], [
            'name' => 'Test User',
            'password' => bcrypt('password'),
        ]);

        // ── Primary user: hnzsama@gmail.com ───────────────────────────────
        $primaryUser = User::firstOrCreate([
            'email' => 'hnzsama@gmail.com',
        ], [
            'name' => 'Hnzsama',
            'password' => bcrypt('password'),
        ]);

        if ($primaryUser->wallets()->count() === 0) {
            Wallet::factory()->create(['user_id' => $primaryUser->id, 'name' => 'Cash', 'type' => 'cash', 'current_balance' => 750000]);
            Wallet::factory()->create(['user_id' => $primaryUser->id, 'name' => 'BCA', 'type' => 'bank', 'current_balance' => 15000000]);
            Wallet::factory()->create(['user_id' => $primaryUser->id, 'name' => 'GoPay', 'type' => 'ewallet', 'current_balance' => 350000]);
        }

        if ($user->wallets()->count() === 0) {
            Wallet::factory()->create(['user_id' => $user->id, 'name' => 'Cash', 'type' => 'cash', 'current_balance' => 500000]);
            Wallet::factory()->create(['user_id' => $user->id, 'name' => 'BCA', 'type' => 'bank', 'current_balance' => 25000000]);
            Wallet::factory()->create(['user_id' => $user->id, 'name' => 'OVO', 'type' => 'ewallet', 'current_balance' => 150000]);
        }

        // Call CategorySeeder to register English categories
        $this->call([
            CategorySeeder::class,
        ]);

        // Seed some transactions for the user
        $wallets = Wallet::where('user_id', $user->id)->get();
        $categories = Category::where('user_id', $user->id)->get();

        if ($wallets->count() > 0 && $categories->count() > 0) {
            for ($i = 0; $i < 30; $i++) {
                $type = rand(0, 1) ? 'income' : 'expense';
                $wallet = $wallets->random();
                $category = $categories->where('type', $type)->random();
                $amount = $type === 'income' ? rand(500000, 15000000) : rand(15000, 2000000);

                Transaction::factory()->create([
                    'user_id' => $user->id,
                    'wallet_id' => $wallet->id,
                    'category_id' => $category->id,
                    'type' => $type,
                    'amount' => $amount,
                    'date' => fake()->dateTimeBetween('-1 month', 'now'),
                ]);

                // Update wallet balance for seeded transaction
                if ($type === 'income') {
                    $wallet->current_balance += $amount;
                } else {
                    $wallet->current_balance -= $amount;
                }
                $wallet->save();
            }
        }

        // 1. Seed Goals
        Goal::factory()->count(4)->create([
            'user_id' => $user->id,
        ]);

        // 2. Seed Subscriptions
        Subscription::factory()->count(4)->create([
            'user_id' => $user->id,
            'wallet_id' => $wallets->random()->id,
        ]);

        // 3. Seed Debts
        Debt::factory()->count(4)->create([
            'user_id' => $user->id,
        ]);

        // 4. Seed Assets
        Asset::factory()->count(5)->create([
            'user_id' => $user->id,
        ]);

        // 5. Seed Budgets
        foreach ($categories->take(3) as $cat) {
            Budget::factory()->create([
                'user_id' => $user->id,
                'category_id' => $cat->id,
            ]);
        }

        // 6. Seed Transfers
        if ($wallets->count() >= 2) {
            /** @var Wallet $from */
            $from = $wallets->first();
            /** @var Wallet $to */
            $to = $wallets->last();
            $transferAmount = 100000;

            $expTx = Transaction::factory()->create([
                'user_id' => $user->id,
                'wallet_id' => $from->id,
                'category_id' => null,
                'type' => 'expense',
                'amount' => $transferAmount,
                'notes' => 'Transfer to '.$to->name,
            ]);

            $incTx = Transaction::factory()->create([
                'user_id' => $user->id,
                'wallet_id' => $to->id,
                'category_id' => null,
                'type' => 'income',
                'amount' => $transferAmount,
                'notes' => 'Transfer from '.$from->name,
            ]);

            Transfer::factory()->create([
                'user_id' => $user->id,
                'from_wallet_id' => $from->id,
                'to_wallet_id' => $to->id,
                'expense_transaction_id' => $expTx->id,
                'income_transaction_id' => $incTx->id,
                'amount' => $transferAmount,
            ]);

            $from->current_balance -= $transferAmount;
            $from->save();
            $to->current_balance += $transferAmount;
            $to->save();
        }

        // 7. Seed Transaction Histories
        $sampleTx = Transaction::where('user_id', $user->id)->first();
        if ($sampleTx) {
            TransactionHistory::factory()->count(2)->create([
                'transaction_id' => $sampleTx->id,
                'user_id' => $user->id,
            ]);
        }
    }
}
