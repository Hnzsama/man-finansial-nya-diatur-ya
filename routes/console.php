<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Automatically process due recurring subscriptions daily
Schedule::command('subscriptions:process')->daily();

// Automatically send due reminders for debts/loans and subscriptions daily
Schedule::command('app:send-due-reminders')->daily();
