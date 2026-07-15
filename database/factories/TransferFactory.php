<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\Transfer;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Transfer>
 */
class TransferFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'from_wallet_id' => Wallet::factory(),
            'to_wallet_id' => Wallet::factory(),
            'expense_transaction_id' => Transaction::factory(),
            'income_transaction_id' => Transaction::factory(),
            'amount' => fake()->randomFloat(2, 50000, 1000000),
            'exchange_rate' => 1.0,
            'date' => fake()->date(),
            'notes' => fake()->sentence(),
        ];
    }
}
