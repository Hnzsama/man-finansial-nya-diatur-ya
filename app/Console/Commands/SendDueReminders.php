<?php

namespace App\Console\Commands;

use App\Jobs\SendWhatsAppNotification;
use App\Models\Debt;
use App\Models\Subscription;
use Carbon\Carbon;
use Illuminate\Console\Command;

class SendDueReminders extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'app:send-due-reminders';

    /**
     * The console command description.
     */
    protected $description = 'Send daily due reminders for debts, loans, and subscriptions via WhatsApp';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $today = Carbon::today();
        $tomorrow = Carbon::tomorrow();
        $threeDaysLater = Carbon::today()->addDays(3);

        // 1. Process Debts Reminders (due in next 3 days, remaining_amount > 0)
        $dueDebts = Debt::where('remaining_amount', '>', 0)
            ->whereBetween('due_date', [$today->format('Y-m-d'), $threeDaysLater->format('Y-m-d')])
            ->get();

        foreach ($dueDebts as $debt) {
            $typeLabel = $debt->type === 'payable' ? 'Hutang (Harus Dibayar)' : 'Piutang (Harus Ditagih)';
            $formattedAmount = number_format((float) $debt->remaining_amount, 0, ',', '.');
            $dueDays = $today->diffInDays($debt->due_date, false);

            $dayText = $dueDays == 0 ? 'hari ini!' : ($dueDays == 1 ? 'besok!' : "dalam {$dueDays} hari.");

            $message = "⚠️ *PENGINGAT TEMPO JATUH TEMPO*\n\n"
                     ."📌 *Tipe:* {$typeLabel}\n"
                     ."👤 *Pihak Lain:* {$debt->counterparty_name}\n"
                     ."💰 *Sisa Tagihan:* Rp {$formattedAmount}\n"
                     ."📅 *Jatuh Tempo:* {$debt->due_date->format('d-m-Y')} ({$dayText})\n"
                     .'📝 *Catatan:* '.($debt->notes ?: '-')."\n\n"
                     ."Mohon segera diselesaikan ya! 💼\n"
                     .'Man Finance Reminder System';

            dispatch(new SendWhatsAppNotification($message));
            $this->info("Dispatched debt reminder for ID {$debt->id}");
        }

        // 2. Process Subscriptions Reminders (due today or tomorrow)
        $dueSubscriptions = Subscription::where('is_active', true)
            ->whereBetween('next_billing_date', [$today->format('Y-m-d'), $tomorrow->format('Y-m-d')])
            ->get();

        foreach ($dueSubscriptions as $sub) {
            $formattedAmount = number_format((float) $sub->amount, 0, ',', '.');
            $dueDays = $today->diffInDays($sub->next_billing_date, false);
            $dayText = $dueDays == 0 ? 'hari ini!' : 'besok!';

            $message = "📅 *PENGINGAT TAGIHAN SUBSCRIPTION*\n\n"
                     ."🔁 *Nama:* {$sub->name}\n"
                     ."💰 *Biaya:* Rp {$formattedAmount}\n"
                     .'💳 *Dompet:* '.($sub->wallet?->name ?? 'Belum ditentukan')."\n"
                     .'🕒 *Frekuensi:* '.ucfirst($sub->frequency)."\n"
                     .'📅 *Tagihan Berikutnya:* '.Carbon::parse($sub->next_billing_date)->format('d-m-Y')." ({$dayText})\n\n"
                     ."Pastikan saldo dompet Anda mencukupi untuk perpanjangan otomatis! 💳\n"
                     .'Man Finance Reminder System';

            dispatch(new SendWhatsAppNotification($message));
            $this->info("Dispatched subscription reminder for ID {$sub->id}");
        }

        return Command::SUCCESS;
    }
}
