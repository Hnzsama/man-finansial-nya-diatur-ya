<?php

namespace Database\Factories;

use App\Models\Goal;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Goal>
 */
class GoalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $target = fake()->randomFloat(2, 1000000, 100000000);
        $current = fake()->randomFloat(2, 0, $target);

        return [
            'user_id' => User::factory(),
            'name' => fake()->randomElement(['Dana Darurat', 'Liburan ke Jepang', 'Beli Laptop Baru', 'DP Rumah', 'Beli Mobil']),
            'target_amount' => $target,
            'current_amount' => $current,
            'deadline' => fake()->dateTimeBetween('now', '+2 years')->format('Y-m-d'),
            'color' => fake()->hexColor(),
            'icon' => fake()->randomElement(['Target', 'PiggyBank', 'Trophy', 'Sparkles']),
        ];
    }
}
