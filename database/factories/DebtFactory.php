<?php

namespace Database\Factories;

use App\Models\Debt;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Debt>
 */
class DebtFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = fake()->randomFloat(2, 50000, 2000000);

        return [
            'user_id' => User::factory(),
            'type' => fake()->randomElement(['payable', 'receivable']),
            'counterparty_name' => fake()->name(),
            'amount' => $amount,
            'remaining_amount' => $amount,
            'due_date' => fake()->dateTimeBetween('now', '+6 months')->format('Y-m-d'),
            'notes' => fake()->sentence(),
            'status' => 'active',
        ];
    }
}
