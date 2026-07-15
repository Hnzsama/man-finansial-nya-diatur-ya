<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Wallet>
 */
class WalletFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['cash', 'bank', 'ewallet', 'digital'];
        $type = fake()->randomElement($types);

        $balance = fake()->randomFloat(2, 10, 50000);

        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement(['BCA', 'Mandiri', 'OVO', 'Gopay', 'Cash', 'Credit Card']),
            'type' => $type,
            'opening_balance' => $balance,
            'current_balance' => $balance,
            'icon' => null,
            'color' => fake()->hexColor(),
            'notes' => fake()->sentence(),
        ];
    }
}
