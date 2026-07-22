<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── Users list ───────────────────────────────────────────────────
        $users = [
            [
                'email' => 'hnzsama@gmail.com',
                'name' => 'Hnzsama',
            ],
            [
                'email' => 'galang@gmail.com',
                'name' => 'Galang',
            ],
        ];

        // ── Income Categories ─────────────────────────────────────────────
        $incomeCategories = [
            ['name' => 'Freelance Projects', 'icon' => 'Laptop', 'color' => '#3B82F6'],
            ['name' => 'ShopeeFood Driver', 'icon' => 'Bike', 'color' => '#F97316'],
            ['name' => 'Uang Saku Orang Tua', 'icon' => 'Wallet', 'color' => '#10B981'],
        ];

        // ── Expense Categories ────────────────────────────────────────────
        $expenseCategories = [
            ['name' => 'Makanan & Minuman', 'icon' => 'Utensils', 'color' => '#EF4444'],
            ['name' => 'Bensin / Transportasi', 'icon' => 'Car', 'color' => '#EAB308'],
            ['name' => 'Kencan / Pacaran', 'icon' => 'Heart', 'color' => '#EC4899'],
            ['name' => 'Kebutuhan Kuliah', 'icon' => 'BookOpen', 'color' => '#8B5CF6'],
            ['name' => 'Biaya Kostan', 'icon' => 'Home', 'color' => '#6366F1'],
            ['name' => 'Internet & Kuota', 'icon' => 'Wifi', 'color' => '#06B6D4'],
            ['name' => 'Ngopi & Nongkrong', 'icon' => 'Coffee', 'color' => '#A16207'],
        ];

        foreach ($users as $userData) {
            $exists = User::where('email', $userData['email'])->exists();

            $user = User::firstOrCreate([
                'email' => $userData['email'],
            ], [
                'name' => $userData['name'],
                'password' => bcrypt('password'),
            ]);

            if ($exists) {
                continue;
            }

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
}
