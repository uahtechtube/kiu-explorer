<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PaymentController extends Controller
{
    /**
     * Get student payment transactions
     */
    public function index(Request $request)
    {
        $student = Auth::user();
        
        if (!$student || !$student->student_profile) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $query = Payment::where('student_id', $student->id);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $transactions = $query->orderBy('created_at', 'desc')->get()->map(function($payment) {
            return [
                'id' => $payment->reference,
                'title' => $payment->description ?? ucfirst($payment->type) . ' Fee',
                'amount' => $payment->amount,
                'status' => ucfirst($payment->status),
                'date' => $payment->transaction_date ?? $payment->created_at->toDateString(),
                'type' => ucfirst($payment->type),
            ];
        });

        return response()->json(['data' => $transactions]);
    }

    /**
     * Get single transaction details
     */
    public function show($id)
    {
        $student = Auth::user();
        $payment = Payment::where('reference', $id)
            ->where('student_id', $student->id)
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        return response()->json([
            'data' => [
                'id' => $payment->reference,
                'title' => $payment->description ?? ucfirst($payment->type) . ' Fee',
                'amount' => $payment->amount,
                'status' => ucfirst($payment->status),
                'date' => $payment->transaction_date ?? $payment->created_at->toDateString(),
                'type' => ucfirst($payment->type),
                'payment_method' => $payment->payment_method,
                'created_at' => $payment->created_at->toDateTimeString(),
            ]
        ]);
    }

    /**
     * Initiate payment
     */
    public function initiate(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:1',
            'type' => 'required|in:tuition,hostel,library,other',
            'description' => 'nullable|string',
        ]);

        $student = Auth::user();
        
        if (!$student || !$student->student_profile) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        // Generate unique reference
        $reference = 'TXN-' . strtoupper(Str::random(10));

        $payment = Payment::create([
            'student_id' => $student->id,
            'amount' => $request->amount,
            'type' => $request->type,
            'description' => $request->description,
            'reference' => $reference,
            'status' => 'pending',
        ]);

        // TODO: Integrate with payment gateway (Paystack, Flutterwave, etc.)
        // For now, return payment details
        return response()->json([
            'message' => 'Payment initiated successfully',
            'data' => [
                'reference' => $reference,
                'amount' => $payment->amount,
                'authorization_url' => url('/payments/gateway?ref=' . $reference),
                // In production, this would be the actual payment gateway URL
            ]
        ]);
    }

    /**
     * Verify payment (webhook from payment gateway)
     */
    public function webhook(Request $request)
    {
        // TODO: Implement payment gateway webhook verification
        // This would verify the payment with the gateway and update status
        
        $reference = $request->reference;
        $payment = Payment::where('reference', $reference)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        // Update payment status based on gateway response
        $payment->update([
            'status' => 'paid', // or 'failed' based on gateway response
            'transaction_date' => now(),
            'payment_method' => $request->payment_method ?? 'card',
        ]);

        return response()->json(['message' => 'Payment verified successfully']);
    }

    /**
     * Download payment receipt
     */
    public function downloadReceipt($id)
    {
        $student = Auth::user();
        $payment = Payment::where('reference', $id)
            ->where('student_id', $student->id)
            ->where('status', 'paid')
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Receipt not found or payment not completed'], 404);
        }

        // TODO: Generate PDF receipt
        // For now, return payment details
        return response()->json([
            'message' => 'Receipt generated successfully',
            'data' => [
                'reference' => $payment->reference,
                'student_name' => $student->first_name . ' ' . $student->surname,
                'matric_number' => $student->student_profile->matric_number ?? 'N/A',
                'amount' => $payment->amount,
                'type' => $payment->type,
                'date' => $payment->transaction_date,
                'status' => $payment->status,
            ]
        ]);
    }

    /**
     * Get payment summary/statistics
     */
    public function summary()
    {
        $student = Auth::user();
        
        if (!$student || !$student->student_profile) {
            return response()->json(['message' => 'Student profile not found'], 404);
        }

        $totalPaid = Payment::where('student_id', $student->id)
            ->where('status', 'paid')
            ->sum('amount');

        $totalPending = Payment::where('student_id', $student->id)
            ->where('status', 'pending')
            ->sum('amount');

        $recentTransactions = Payment::where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'data' => [
                'total_paid' => $totalPaid,
                'total_pending' => $totalPending,
                'recent_transactions' => $recentTransactions,
            ]
        ]);
    }
}
