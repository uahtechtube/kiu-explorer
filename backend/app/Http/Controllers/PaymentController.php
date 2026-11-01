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
        
        if (!$student || $student->role !== 'student') {
            return response()->json(['message' => 'Student profile not found or unauthorized'], 404);
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
        
        if (!$student || $student->role !== 'student') {
            return response()->json(['message' => 'Student profile not found or unauthorized'], 404);
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
        $paystackSecret = env('PAYSTACK_SECRET_KEY');
        $useSandbox = env('PAYSTACK_USE_SANDBOX', true);

        if ($paystackSecret && !$useSandbox) {
            // Call Paystack API to initialize transaction
            $url = "https://api.paystack.co/transaction/initialize";
            $fields = [
                'email' => $student->email,
                'amount' => $request->amount * 100, // Paystack requires amount in kobo
                'reference' => $reference,
                'callback_url' => url('/payments/callback'),
                'metadata' => [
                    'payment_id' => $payment->id,
                    'type' => $request->type,
                ]
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer " . $paystackSecret,
                "Cache-Control: no-cache",
                "Content-Type: application/json",
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            $result = curl_exec($ch);
            $err = curl_error($ch);
            curl_close($ch);

            if (!$err) {
                $response = json_decode($result, true);
                if (isset($response['status']) && $response['status'] === true) {
                    return response()->json([
                        'message' => 'Payment initiated successfully via Paystack',
                        'data' => [
                            'reference' => $reference,
                            'amount' => $payment->amount,
                            'authorization_url' => $response['data']['authorization_url'],
                        ]
                    ]);
                }
            }
        }

        // Sandbox/Simulated fallback if keys are missing or API fails
        return response()->json([
            'message' => 'Payment initiated successfully (Simulated Sandbox)',
            'data' => [
                'reference' => $reference,
                'amount' => $payment->amount,
                'authorization_url' => url('/payments/gateway?ref=' . $reference),
            ]
        ]);
    }

    /**
     * Verify payment (webhook from payment gateway)
     */
    public function webhook(Request $request)
    {
        $paystackSecret = env('PAYSTACK_SECRET_KEY');

        if ($paystackSecret && $request->hasHeader('x-paystack-signature')) {
            $input = $request->getContent();
            $signature = $request->header('x-paystack-signature');
            if ($signature !== hash_hmac('sha512', $input, $paystackSecret)) {
                return response()->json(['message' => 'Invalid webhook signature'], 400);
            }

            $event = json_decode($input, true);
            if (isset($event['event']) && $event['event'] === 'charge.success') {
                $reference = $event['data']['reference'];
                $payment = Payment::where('reference', $reference)->first();
                if ($payment) {
                    $payment->update([
                        'status' => 'paid',
                        'transaction_date' => now(),
                        'payment_method' => $event['data']['authorization']['channel'] ?? 'card',
                    ]);
                    
                    // Auto-approve hostel booking on successful payment
                    if ($payment->type === 'hostel') {
                        $booking = \App\Models\HostelBooking::where('payment_id', $payment->id)->first();
                        if ($booking && $booking->status === 'pending') {
                            $room = $booking->room;
                            $bed = $room ? $room->beds()->where('is_occupied', false)->first() : null;
                            if ($room && $bed && $room->available_slots > 0) {
                                $booking->update([
                                    'status' => 'approved',
                                    'approved_at' => now(),
                                ]);
                                $bed->update([
                                    'is_occupied' => true,
                                    'student_id' => $booking->student_id,
                                ]);
                                $room->decrement('available_slots');
                                if ($room->available_slots === 0) {
                                    $room->update(['status' => 'full']);
                                }
                            }
                        }
                    }
                    
                    return response()->json(['message' => 'Payment updated successfully via Paystack webhook']);
                }
            }
            return response()->json(['message' => 'Event not handled']);
        }

        // Sandbox/Simulated webhook fallback
        $reference = $request->reference;
        $payment = Payment::where('reference', $reference)->first();

        if (!$payment) {
            return response()->json(['message' => 'Payment not found'], 404);
        }

        $payment->update([
            'status' => 'paid',
            'transaction_date' => now(),
            'payment_method' => $request->payment_method ?? 'card',
        ]);

        // Auto-approve hostel booking on successful sandbox payment
        if ($payment->type === 'hostel') {
            $booking = \App\Models\HostelBooking::where('payment_id', $payment->id)->first();
            if ($booking && $booking->status === 'pending') {
                $room = $booking->room;
                $bed = $room ? $room->beds()->where('is_occupied', false)->first() : null;
                if ($room && $bed && $room->available_slots > 0) {
                    $booking->update([
                        'status' => 'approved',
                        'approved_at' => now(),
                    ]);
                    $bed->update([
                        'is_occupied' => true,
                        'student_id' => $booking->student_id,
                    ]);
                    $room->decrement('available_slots');
                    if ($room->available_slots === 0) {
                        $room->update(['status' => 'full']);
                    }
                }
            }
        }

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
                'matric_number' => $student->studentProfile->matric_number ?? 'N/A',
                'amount' => $payment->amount,
                'type' => $payment->type,
                'date' => $payment->transaction_date,
                'status' => $payment->status,
            ]
        ]);
    }

    /**
     * Download printable receipt as high-fidelity HTML/CSS page (Web View)
     */
    public function downloadReceiptWeb(Request $request, $reference)
    {
        $student = Auth::user();

        // Check if token is passed in query parameter for browser authentication
        if (!$student && $request->has('token')) {
            $token = $request->query('token');
            $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            
            // Fallback 1: If URL encoding discrepancy exists
            if (!$tokenModel && strpos($token, '%7C') !== false) {
                $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken(urldecode($token));
            }
            
            // Fallback 2: Manual lookup by splitting ID and Token parts
            if (!$tokenModel && strpos($token, '|') !== false) {
                [$id, $plainToken] = explode('|', $token, 2);
                $instance = \Laravel\Sanctum\PersonalAccessToken::find($id);
                if ($instance && hash_equals($instance->token, hash('sha256', $plainToken))) {
                    $tokenModel = $instance;
                }
            }

            // Fallback 3: Hashed lookup direct
            if (!$tokenModel) {
                $tokenModel = \Laravel\Sanctum\PersonalAccessToken::where('token', hash('sha256', $token))->first();
            }

            if ($tokenModel) {
                $student = $tokenModel->tokenable;
            }
        }

        if (!$student) {
            return response("<html><body style='font-family:sans-serif; text-align:center; padding:50px;'><h2>401 Unauthenticated</h2><p>Please log in from the application to download your receipt.</p></body></html>", 401);
        }

        $payment = Payment::where('reference', $reference)->first();

        if (!$payment) {
            return response("<html><body style='font-family:sans-serif; text-align:center; padding:50px;'><h2>Receipt Not Found</h2><p>The requested transaction reference <strong>{$reference}</strong> was not found in our database.</p></body></html>", 404);
        }

        if ((int) $payment->student_id !== (int) $student->id) {
            return response("<html><body style='font-family:sans-serif; text-align:center; padding:50px;'><h2>Access Denied</h2><p>You do not have permission to view this receipt. This receipt belongs to a different student user.</p></body></html>", 403);
        }

        if ($payment->status !== 'paid') {
            return response("<html><body style='font-family:sans-serif; text-align:center; padding:50px;'><h2>Payment Pending</h2><p>Your payment for reference <strong>{$reference}</strong> is still pending authorization or has failed. Current status: " . strtoupper($payment->status) . "</p></body></html>", 400);
        }

        $student->load('studentProfile');
        
        // Fetch hostel room details
        $booking = \App\Models\HostelBooking::with('room.hostel')->where('payment_id', $payment->id)->first();
        $hostelName = $booking && $booking->room && $booking->room->hostel ? $booking->room->hostel->name : 'N/A';
        $roomNumber = $booking && $booking->room ? $booking->room->room_number : 'N/A';
        
        $serviceFee = (float) cache()->get('settings.hostel_service_fee', 5000.00);
        $roomPrice = $payment->amount - $serviceFee;
        if ($roomPrice < 0) {
            $roomPrice = $payment->amount;
            $serviceFee = 0.00;
        }

        $formattedAmount = number_format($payment->amount, 2);
        $formattedRoomPrice = number_format($roomPrice, 2);
        $formattedServiceFee = number_format($serviceFee, 2);
        $formattedDate = $payment->transaction_date ? $payment->transaction_date->toDayDateTimeString() : $payment->updated_at->toDayDateTimeString();
        $studentName = $student->first_name . ' ' . $student->surname;
        $matricNumber = $student->studentProfile->matric_number ?? ($student->matric_number ?? 'N/A');
        $sessionName = $booking ? $booking->academic_session : 'N/A';

        return "
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Receipt - {$payment->reference}</title>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');
                
                body {
                    font-family: 'Outfit', sans-serif;
                    background: #f8fafc;
                    margin: 0;
                    padding: 40px 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    color: #0f172a;
                }
                .receipt-container {
                    background: white;
                    max-width: 600px;
                    width: 100%;
                    border-radius: 32px;
                    box-shadow: 0 20px 40px -15px rgba(0, 21, 55, 0.08);
                    border: 1px solid #f1f5f9;
                    overflow: hidden;
                }
                .header {
                    background: linear-gradient(135deg, #002147, #001530);
                    padding: 40px;
                    text-align: center;
                    color: white;
                    position: relative;
                }
                .header .logo {
                    font-size: 26px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                    margin-bottom: 6px;
                }
                .header .logo span {
                    color: #ffd700;
                }
                .header .subtitle {
                    font-size: 13px;
                    opacity: 0.8;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    background: rgba(16, 185, 129, 0.15);
                    color: #10b981;
                    padding: 8px 16px;
                    border-radius: 100px;
                    font-weight: 700;
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-top: 20px;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }
                .content {
                    padding: 40px;
                }
                .section-title {
                    font-size: 11px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: #94a3b8;
                    margin-bottom: 16px;
                    border-bottom: 1px solid #f1f5f9;
                    padding-bottom: 8px;
                    margin-top: 20px;
                }
                .grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 10px;
                }
                .item label {
                    font-size: 12px;
                    color: #64748b;
                    display: block;
                    margin-bottom: 4px;
                    font-weight: 500;
                }
                .item span {
                    font-size: 15px;
                    font-weight: 700;
                    color: #0f172a;
                }
                .table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 24px 0;
                }
                .table th {
                    text-align: left;
                    font-size: 12px;
                    color: #64748b;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #e2e8f0;
                }
                .table td {
                    padding: 16px 0;
                    font-size: 14px;
                    color: #334155;
                    border-bottom: 1px dashed #e2e8f0;
                }
                .table td.price {
                    text-align: right;
                    font-weight: 700;
                    color: #0f172a;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 0 0 0;
                    margin-top: 12px;
                }
                .total-label {
                    font-size: 18px;
                    font-weight: 800;
                    color: #0f172a;
                }
                .total-value {
                    font-size: 26px;
                    font-weight: 900;
                    color: #002147;
                }
                .footer {
                    background: #f8fafc;
                    padding: 30px 40px;
                    text-align: center;
                    border-top: 1px solid #f1f5f9;
                }
                .btn-print {
                    background: #002147;
                    color: white;
                    border: none;
                    padding: 16px 32px;
                    border-radius: 16px;
                    font-weight: 700;
                    font-size: 15px;
                    cursor: pointer;
                    display: inline-flex;
                    align-items: center;
                    box-shadow: 0 4px 12px rgba(0, 33, 71, 0.15);
                    transition: all 0.2s;
                }
                .btn-print:hover {
                    background: #001530;
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(0, 33, 71, 0.2);
                }
                .secure-note {
                    font-size: 11px;
                    color: #94a3b8;
                    margin-top: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }
                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body {
                        background: #f8fafc;
                        padding: 0;
                    }
                    .receipt-container {
                        box-shadow: none;
                        border: none;
                        max-width: 100%;
                    }
                    .footer {
                        display: none;
                    }
                }
            </style>
        </head>
        <body>
            <div class='receipt-container'>
                <div class='header'>
                    <div class='logo'>KIU <span>EXPLORER</span></div>
                    <div class='subtitle'>Official Payment Receipt</div>
                    <div class='status-badge'>✓ Payment Approved</div>
                </div>
                <div class='content'>
                    <div class='section-title'>Transaction Details</div>
                    <div class='grid'>
                        <div class='item'>
                            <label>Payment Reference</label>
                            <span>{$payment->reference}</span>
                        </div>
                        <div class='item'>
                            <label>Date & Time</label>
                            <span>{$formattedDate}</span>
                        </div>
                        <div class='item'>
                            <label>Payment Method</label>
                            <span>Credit/Debit Card</span>
                        </div>
                        <div class='item'>
                            <label>Transaction Status</label>
                            <span style='color: #10b981;'>PAID</span>
                        </div>
                    </div>

                    <div class='section-title'>Student Information</div>
                    <div class='grid'>
                        <div class='item'>
                            <label>Student Name</label>
                            <span>{$studentName}</span>
                        </div>
                        <div class='item'>
                            <label>Matric Number</label>
                            <span>{$matricNumber}</span>
                        </div>
                        <div class='item'>
                            <label>Student Email</label>
                            <span>{$student->email}</span>
                        </div>
                        <div class='item'>
                            <label>Academic Session</label>
                            <span>{$sessionName}</span>
                        </div>
                    </div>

                    <div class='section-title'>Payment Breakdown</div>
                    <table class='table'>
                        <thead>
                            <tr>
                                <th>Item Description</th>
                                <th style='text-align: right;'>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Hostel Accommodation Fee<br><small style='color:#64748b;'>{$hostelName} - Room {$roomNumber}</small></td>
                                <td class='price'>₦{$formattedRoomPrice}</td>
                            </tr>
                            <tr>
                                <td>Hostel Service Charge<br><small style='color:#64748b;'>Admin Portal Configured Levy</small></td>
                                <td class='price'>₦{$formattedServiceFee}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class='total-row'>
                        <div class='total-label'>Total Amount Paid</div>
                        <div class='total-value'>₦{$formattedAmount}</div>
                    </div>
                </div>
                <div class='footer'>
                    <button class='btn-print' onclick='window.print();'>
                        <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' style='margin-right: 8px;'><polyline points='6 9 6 2 18 2 18 9'></polyline><path d='M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'></path><rect x='6' y='14' width='12' height='8'></rect></svg>
                        Print Receipt / Save PDF
                    </button>
                    <div class='secure-note'>
                        <svg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.5'><rect x='3' y='11' width='18' height='11' rx='2' ry='2'></rect><path d='M7 11V7a5 5 0 0 1 10 0v4'></path></svg>
                        Secure Digital Receipt • Kashim Ibrahim University
                    </div>
                </div>
            </div>
        </body>
        </html>
        ";
    }

    /**
     * Resume/Reopen payment checkout for a pending transaction
     */
    public function resume(Request $request, $reference)
    {
        $student = Auth::user();
        if (!$student || $student->role !== 'student') {
            return response()->json(['message' => 'Student profile not found or unauthorized'], 404);
        }

        $payment = Payment::where('reference', $reference)
            ->where('student_id', $student->id)
            ->first();

        if (!$payment) {
            return response()->json(['message' => 'Transaction not found'], 404);
        }

        if ($payment->status !== 'pending') {
            return response()->json(['message' => 'Only pending payments can be resumed'], 400);
        }

        $paystackSecret = env('PAYSTACK_SECRET_KEY');
        $useSandbox = env('PAYSTACK_USE_SANDBOX', true);

        if ($paystackSecret && !$useSandbox) {
            // For real Paystack, we call API to initialize a transaction.
            // To avoid reference collisions on Paystack, we generate a new reference and update our record.
            $newReference = 'TXN-' . strtoupper(\Illuminate\Support\Str::random(10));
            
            $payment->update(['reference' => $newReference]);
            $reference = $newReference;

            $url = "https://api.paystack.co/transaction/initialize";
            $fields = [
                'email' => $student->email,
                'amount' => $payment->amount * 100,
                'reference' => $newReference,
                'callback_url' => url('/payments/callback'),
                'metadata' => [
                    'payment_id' => $payment->id,
                    'type' => $payment->type,
                ]
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer " . $paystackSecret,
                "Cache-Control: no-cache",
                "Content-Type: application/json",
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            $result = curl_exec($ch);
            $err = curl_error($ch);
            curl_close($ch);

            if (!$err) {
                $response = json_decode($result, true);
                if (isset($response['status']) && $response['status'] === true) {
                    return response()->json([
                        'message' => 'Payment resumed successfully via Paystack',
                        'data' => [
                            'reference' => $newReference,
                            'amount' => $payment->amount,
                            'authorization_url' => $response['data']['authorization_url'],
                        ]
                    ]);
                }
            }
        }

        // Sandbox/Simulated fallback
        return response()->json([
            'message' => 'Payment resumed successfully (Simulated Sandbox)',
            'data' => [
                'reference' => $reference,
                'amount' => $payment->amount,
                'authorization_url' => url('/payments/gateway?ref=' . $reference),
            ]
        ]);
    }

    /**
     * Get payment summary/statistics
     */
    public function summary()
    {
        $student = Auth::user();
        
        if (!$student || $student->role !== 'student') {
            return response()->json(['message' => 'Student profile not found or unauthorized'], 404);
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
