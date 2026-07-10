# Advanced Entities (Debt, Subscription, Budget, Goal, Asset)

## 1. Debt (Hutang / Piutang)
```php
Schema::create('debts', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->enum('type', ['payable', 'receivable']); // Hutang (payable) atau Piutang (receivable)
    $table->string('counterparty_name'); // Siapa yang menghutangi / berhutang
    $table->decimal('amount', 15, 2);
    $table->decimal('remaining_amount', 15, 2);
    $table->date('due_date')->nullable();
    $table->text('notes')->nullable();
    $table->enum('status', ['active', 'paid_off', 'cancelled'])->default('active');
    $table->timestamps();
    $table->softDeletes();
});
```

## 2. Subscription (Tagihan Berulang)
```php
Schema::create('subscriptions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('wallet_id')->constrained()->cascadeOnDelete();
    $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
    $table->string('name'); // Contoh: Netflix, Listrik
    $table->decimal('amount', 15, 2);
    $table->enum('frequency', ['daily', 'weekly', 'monthly', 'yearly']);
    $table->date('next_billing_date');
    $table->boolean('is_active')->default(true);
    $table->text('notes')->nullable();
    $table->timestamps();
    $table->softDeletes();
});
```

## 3. Budget (Anggaran)
```php
Schema::create('budgets', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('category_id')->nullable()->constrained()->cascadeOnDelete(); // Jika null = anggaran global
    $table->string('name');
    $table->decimal('amount_limit', 15, 2);
    $table->enum('period', ['weekly', 'monthly', 'yearly', 'custom']);
    $table->date('start_date')->nullable();
    $table->date('end_date')->nullable();
    $table->timestamps();
});
```

## 4. Goal (Target Keuangan)
```php
Schema::create('goals', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('name'); // e.g. "Dana Darurat", "MacBook Baru"
    $table->decimal('target_amount', 15, 2);
    $table->decimal('current_amount', 15, 2)->default(0);
    $table->date('deadline')->nullable();
    $table->string('color')->nullable();
    $table->string('icon')->nullable();
    $table->timestamps();
    $table->softDeletes();
});
```

## 5. Asset (Aset dan Kekayaan)
```php
Schema::create('assets', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('name'); // e.g. "Saham BBCA", "Emas 10gr"
    $table->enum('type', ['savings', 'deposit', 'gold', 'stock', 'crypto', 'property']);
    $table->decimal('current_value', 15, 2)->default(0);
    $table->text('notes')->nullable();
    $table->timestamps();
    $table->softDeletes();
});
```
