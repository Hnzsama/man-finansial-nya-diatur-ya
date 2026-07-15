<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $types = ['income', 'expense'];

        return [
            'user_id' => User::factory(),
            'name' => $this->faker->words(2, true),
            'type' => $this->faker->randomElement($types),
            'icon' => null,
            'color' => $this->faker->hexColor(),
            'is_archived' => false,
        ];
    }
}
