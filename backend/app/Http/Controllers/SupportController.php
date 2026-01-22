<?php

namespace App\Http\Controllers;

use App\Models\SupportTicket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SupportController extends Controller
{
    /**
     * Get FAQs and recent tickets
     */
    public function index(Request $request)
    {
        $faqs = [
            [
                'question' => 'How do I check my results?',
                'answer' => 'Go to the Academic Record section in your profile or check the Student Dashboard for latest updates.'
            ],
            [
                'question' => 'Can I change my course registration?',
                'answer' => 'Course registration changes are allowed only within the first 2 weeks of the semester. Contact your department for help.'
            ],
            [
                'question' => 'How do I reset my portal password?',
                'answer' => 'You can reset your password from the login screen using the "Forgot Password" link or in Account Settings if you are logged in.'
            ],
            [
                'question' => 'Who do I contact for payment issues?',
                'answer' => 'Please raise a ticket here selecting "Payment Issue" as the subject or visit the Bursary department.'
            ]
        ];

        $tickets = SupportTicket::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'faqs' => $faqs,
            'tickets' => $tickets
        ]);
    }

    /**
     * Submit a support ticket
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'priority' => 'in:low,medium,high'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $ticket = SupportTicket::create([
            'user_id' => $request->user()->id,
            'subject' => $request->subject,
            'message' => $request->message,
            'priority' => $request->priority ?? 'medium',
            'status' => 'open'
        ]);

        return response()->json([
            'message' => 'Ticket submitted successfully',
            'ticket' => $ticket
        ], 201);
    }
}
