<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Transaction extends Model
{
    use HasFactory, SoftDeletes;

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
        'date' => 'datetime',
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

    protected static function booted(): void
    {
        static::created(function (Transaction $transaction) {
            $walletName = $transaction->wallet?->name ?? 'Unknown Wallet';
            $categoryName = $transaction->category?->name ?? 'No Category';
            $typeLabel = $transaction->type === 'income' ? 'Pemasukan' : 'Pengeluaran';
            $formattedAmount = number_format((float) $transaction->amount, 0, ',', '.');
            $dateFormatted = $transaction->date ? $transaction->date->timezone('Asia/Jakarta')->format('d-m-Y H:i') : now('Asia/Jakarta')->format('d-m-Y H:i');

            $message = "🔔 *Notifikasi Transaksi Baru*\n\n"
                     . "🏷️ *Tipe:* {$typeLabel}\n"
                     . "💰 *Jumlah:* Rp {$formattedAmount}\n"
                     . "💳 *Dompet:* {$walletName}\n"
                     . "📁 *Kategori:* {$categoryName}\n"
                     . "📅 *Tanggal:* {$dateFormatted}\n"
                     . "📝 *Catatan:* " . ($transaction->notes ?: '-') . "\n\n"
                     . "Man Finance - Diatur ya keuangannya! 💪";

            dispatch(new \App\Jobs\SendWhatsAppNotification($message));
        });
    }

    /**
     * Scope a query to only include non-transfer transactions.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeWithoutTransfers($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('metadata->is_transfer')
              ->orWhere('metadata->is_transfer', '!=', true);
        });
    }
}
