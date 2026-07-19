<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppService
{
    /**
     * Send a WhatsApp message using the configured WhatsApp API server.
     */
    public static function sendMessage(string $message): bool
    {
        $apiUrl = config('services.whatsapp.url', 'http://127.0.0.1:3000');
        $token = config('services.whatsapp.token');
        $to = config('services.whatsapp.notify_number');

        if (empty($to)) {
            Log::warning('WhatsApp Notification: Destination number (WHATSAPP_NOTIFY_NUMBER) is not configured.');

            return false;
        }

        try {
            $response = Http::withHeaders([
                'x-api-key' => $token,
                'Content-Type' => 'application/json',
            ])->post("{$apiUrl}/send-message", [
                'to' => $to,
                'message' => $message,
            ]);

            if ($response->successful()) {
                Log::info("WhatsApp Notification sent successfully to {$to}");

                return true;
            }

            Log::error("WhatsApp Notification failed. Status: {$response->status()}, Response: ".$response->body());

            return false;
        } catch (\Exception $e) {
            Log::error('WhatsApp Notification exception: '.$e->getMessage());

            return false;
        }
    }
}
