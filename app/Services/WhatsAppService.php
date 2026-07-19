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
        $apiUrl = env('WHATSAPP_API_URL', 'http://127.0.0.1:3000');
        $token = env('WHATSAPP_API_TOKEN', 'd3fd0ed1f3157c901b5c07f89933bf9ba64380778c2d8ce615a067c01c13694b');
        $to = env('WHATSAPP_NOTIFY_NUMBER');

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
