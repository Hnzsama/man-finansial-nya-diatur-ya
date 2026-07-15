<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

class TransactionFactory extends Factory
{
    protected $model = Transaction::class;

    public function definition(): array
    {
        $type = $this->faker->randomElement(['income', 'expense']);
        $amount = $type === 'income'
            ? $this->faker->numberBetween(500000, 15000000) // Rp 500k to Rp 15m
            : $this->faker->numberBetween(15000, 2000000); // Rp 15k to Rp 2m

        return [
            'user_id' => User::factory(),
            'wallet_id' => Wallet::factory(),
            'category_id' => Category::factory(),
            'type' => $type,
            'amount' => $amount,
            'date' => $this->faker->dateTimeBetween('-2 months', 'now'),
            'notes' => $this->faker->sentence(),
        ];
    }
}
