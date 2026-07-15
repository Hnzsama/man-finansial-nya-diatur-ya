<?php

namespace Database\Factories;

use App\Models\Transaction;
use App\Models\TransactionHistory;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TransactionHistory>
 */
class TransactionHistoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $field = fake()->randomElement(['amount', 'notes', 'date', 'wallet_id', 'category_id']);
        $oldVal = null;
        $newVal = null;

        switch ($field) {
            case 'amount':
                $oldVal = (string) fake()->numberBetween(20000, 100000);
                $newVal = (string) fake()->numberBetween(110000, 250000);
                break;
            case 'date':
                $oldVal = fake()->dateTimeBetween('-1 month', 'now')->format('Y-m-d');
                $newVal = fake()->dateTimeBetween('now', '+1 month')->format('Y-m-d');
                break;
            case 'wallet_id':
            case 'category_id':
                $oldVal = (string) fake()->numberBetween(1, 5);
                $newVal = (string) fake()->numberBetween(6, 10);
                break;
            default:
                $oldVal = fake()->sentence(3);
                $newVal = fake()->sentence(3);
                break;
        }

        return [
            'transaction_id' => Transaction::factory(),
            'user_id' => User::factory(),
            'field_changed' => $field,
            'old_value' => $oldVal,
            'new_value' => $newVal,
        ];
    }
}
