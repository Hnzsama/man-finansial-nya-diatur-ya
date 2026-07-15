<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();

        if (! $user) {
            $user = User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);
        }

        $incomeCategories = [
            ['name' => 'Salary', 'icon' => 'Briefcase', 'color' => '#10B981'],
            ['name' => 'Freelance', 'icon' => 'Laptop', 'color' => '#34D399'],
            ['name' => 'Investments', 'icon' => 'TrendingUp', 'color' => '#059669'],
        ];

        $expenseCategories = [
            ['name' => 'Food & Dining', 'icon' => 'Utensils', 'color' => '#F43F5E'],
            ['name' => 'Transportation', 'icon' => 'Car', 'color' => '#FB923C'],
            ['name' => 'Housing', 'icon' => 'Home', 'color' => '#8B5CF6'],
            ['name' => 'Utilities', 'icon' => 'Zap', 'color' => '#F59E0B'],
            ['name' => 'Entertainment', 'icon' => 'Film', 'color' => '#EC4899'],
            ['name' => 'Shopping', 'icon' => 'ShoppingBag', 'color' => '#D946EF'],
            ['name' => 'Healthcare', 'icon' => 'Heart', 'color' => '#EF4444'],
        ];

        foreach ($incomeCategories as $cat) {
            Category::firstOrCreate([
                'user_id' => $user->id,
                'name' => $cat['name'],
                'type' => 'income',
            ], [
                'icon' => $cat['icon'],
                'color' => $cat['color'],
            ]);
        }

        foreach ($expenseCategories as $cat) {
            Category::firstOrCreate([
                'user_id' => $user->id,
                'name' => $cat['name'],
                'type' => 'expense',
            ], [
                'icon' => $cat['icon'],
                'color' => $cat['color'],
            ]);
        }
    }
}
