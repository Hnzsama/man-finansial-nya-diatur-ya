<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->foreignId('from_wallet_id')->constrained('wallets')->cascadeOnDelete();
            $table->foreignId('to_wallet_id')->constrained('wallets')->cascadeOnDelete();

            $table->foreignId('expense_transaction_id')->constrained('transactions')->cascadeOnDelete();
            $table->foreignId('income_transaction_id')->constrained('transactions')->cascadeOnDelete();

            $table->decimal('amount', 15, 2);
            $table->decimal('exchange_rate', 10, 4)->default(1.0000);
            $table->date('date');
            $table->text('notes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transfers');
    }
};
