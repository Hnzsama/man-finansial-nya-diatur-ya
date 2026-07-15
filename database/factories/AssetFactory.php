<?php

namespace Database\Factories;

use App\Models\Asset;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Asset>
 */
class AssetFactory extends Factory
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
            'name' => fake()->randomElement(['Emas Antam 10g', 'Saham BBRI', 'Deposito Mandiri', 'Reksadana Sucor', 'Bitcoin', 'Rumah Kost']),
            'type' => fake()->randomElement(['savings', 'deposit', 'gold', 'stock', 'crypto', 'property']),
            'current_value' => fake()->randomFloat(2, 500000, 100000000),
            'notes' => fake()->sentence(),
        ];
    }
}
