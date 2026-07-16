<?php

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can login and get token', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => 'test@example.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);
});

test('authenticated user can access dashboard api', function () {
    $user = User::factory()->create();
    $wallet = Wallet::factory()->create([
        'user_id' => $user->id,
        'current_balance' => 50000,
    ]);

    $token = $user->createToken('test-device')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->getJson('/api/dashboard');

    $response->assertStatus(200)
        ->assertJsonFragment([
            'total_balance' => 50000,
        ]);
});

test('unauthenticated user cannot access api resources', function () {
    $response = $this->getJson('/api/dashboard');

    $response->assertStatus(401);
});
