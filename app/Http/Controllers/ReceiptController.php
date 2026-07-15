<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReceiptController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Retrieve transactions to list as virtual invoices/receipts
        $receipts = Transaction::where('user_id', $user->id)
            ->where('type', 'expense')
            ->with(['wallet:id,name', 'category:id,name'])
            ->orderBy('date', 'desc')
            ->paginate(12);

        return Inertia::render('Receipts/Index', [
            'receipts' => $receipts,
        ]);
    }
}
