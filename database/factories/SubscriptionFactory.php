<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Subscription;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subscription>
 */
class SubscriptionFactory extends Factory
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
            'wallet_id' => Wallet::factory(),
            'category_id' => Category::factory(),
            'name' => fake()->randomElement(['Netflix Premium', 'Spotify Family', 'AWS Hosting', 'House Electricity', 'Gym Membership']),
            'amount' => fake()->randomFloat(2, 50000, 250000),
            'frequency' => fake()->randomElement(['daily', 'weekly', 'monthly', 'yearly']),
            'next_billing_date' => fake()->dateTimeBetween('now', '+1 month')->format('Y-m-d'),
            'is_active' => true,
            'notes' => fake()->sentence(),
        ];
    }
}
