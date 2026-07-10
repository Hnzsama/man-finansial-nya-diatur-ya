# Transaction & History

## Migrations

### Transactions Table
```php
Schema::create('transactions', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('wallet_id')->constrained()->cascadeOnDelete();
    $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignId('goal_id')->nullable()->constrained()->nullOnDelete();
    $table->foreignId('debt_id')->nullable()->constrained()->nullOnDelete();
    
    $table->enum('type', ['income', 'expense', 'transfer', 'adjustment']);
    $table->decimal('amount', 15, 2);
    $table->date('date');
    $table->text('notes')->nullable();
    $table->string('attachment_path')->nullable();
    $table->json('metadata')->nullable(); // Flexible data like location, tags, extra info
    
    $table->timestamps();
    $table->softDeletes();
});
```

### Transaction Histories (Audit Trail)
```php
Schema::create('transaction_histories', function (Blueprint $table) {
    $table->id();
    $table->foreignId('transaction_id')->constrained()->cascadeOnDelete();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('field_changed');
    $table->text('old_value')->nullable();
    $table->text('new_value')->nullable();
    $table->timestamps();
});
```

### Transfers (Linking 2 Transactions)
```php
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
```

## Model (`app/Models/Transaction.php`)
```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Transaction extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'wallet_id',
        'category_id',
        'goal_id',
        'debt_id',
        'type',
        'amount',
        'date',
        'notes',
        'attachment_path',
        'metadata',
    ];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
        'metadata' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // Links to Goals and Debts for tracking progress/payments
    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class);
    }

    public function debt(): BelongsTo
    {
        return $this->belongsTo(Debt::class);
    }

    public function histories(): HasMany
    {
        return $this->hasMany(TransactionHistory::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }
}
```
