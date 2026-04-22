<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;

class AdminPaymentController extends Controller
{
    /**
     * Get all payments (for Finance Officer)
     */
    public function index(Request $request)
    {
        $query = Payment::with(['student']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('payment_method')) {
            $query->where('payment_method', $request->payment_method);
        }

        $payments = $query->orderBy('created_at', 'desc')->paginate(50);
        return response()->json(['data' => $payments]);
    }

    /**
     * Manually verify a payment
     */
    public function verifyPayment($reference, Request $request)
    {
        $request->validate([
            'payment_method' => 'required|string|in:card,bank_transfer,finxchange,manual',
            'amount_confirmed' => 'required|numeric'
        ]);

        $payment = Payment::where('reference', $reference)->firstOrFail();

        if ($payment->status === 'paid') {
            return response()->json(['message' => 'Payment has already been verified.'], 400);
        }

        if ($request->amount_confirmed < $payment->amount) {
            return response()->json(['message' => 'Confirmed amount is less than expected amount.'], 400);
        }

        $payment->update([
            'status' => 'paid',
            'transaction_date' => now(),
            'payment_method' => $request->payment_method,
        ]);

        // If it was a hostel payment, we could optionally update HostelBooking status 
        // to 'paid', or allocation to active. Handled separately or via events.

        return response()->json([
            'status' => 'success',
            'message' => 'Payment manually verified successfully.',
            'data' => $payment
        ]);
    }
}
