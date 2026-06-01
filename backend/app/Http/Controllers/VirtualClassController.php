<?php

namespace App\Http\Controllers;

use App\Models\VirtualClass;
use App\Models\VirtualClassMessage; // Add this line
use App\Models\Attendance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class VirtualClassController extends Controller
{
    /**
     * List virtual classes. Students can see all upcoming/active classes.
     */
    public function index(Request $request)
    {
        $query = VirtualClass::with(['course', 'lecturer:id,surname,first_name']);

        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            // By default show upcoming and active
            $query->whereIn('status', ['upcoming', 'active']);
        }

        $classes = $query->orderBy('scheduled_at', 'asc')->paginate(20);

        $classes->getCollection()->transform(function($class) {
            $class->lecturer_name = $class->lecturer ? $class->lecturer->first_name . ' ' . $class->lecturer->surname : 'N/A';
            return $class;
        });

        return response()->json($classes);
    }

    /**
     * Store a new virtual class (Lecturers only).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'course_id' => 'required|exists:courses,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date',
            'duration' => 'required|integer|min:1',
            'meeting_link' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $user = $request->user();
        if ($user->role !== 'lecturer' && $user->role !== 'admin') {
            return response()->json(['message' => 'Only lecturers or admins can schedule classes.'], 403);
        }

        $meetingLink = $request->meeting_link;
        if ($meetingLink && !preg_match("~^(?:f|ht)tps?://~i", $meetingLink)) {
            $meetingLink = "https://" . $meetingLink;
        }

        $virtualClass = VirtualClass::create([
            'course_id' => $request->course_id,
            'lecturer_id' => $user->id,
            'title' => $request->title,
            'description' => $request->description,
            'scheduled_at' => $request->scheduled_at,
            'duration' => $request->duration,
            'meeting_link' => $meetingLink,
            'status' => 'upcoming',
        ]);

        // Send notifications to all students enrolled in this course
        $this->notifyStudentsAboutNewClass($virtualClass);

        return response()->json([
            'message' => 'Virtual class scheduled successfully',
            'virtual_class' => $virtualClass
        ], 201);
    }

    /**
     * Send notifications to students about new virtual class
     */
    private function notifyStudentsAboutNewClass($virtualClass)
    {
        try {
            // Get all students enrolled in this course
            $enrolledStudents = \App\Models\CourseRegistration::where('course_id', $virtualClass->course_id)
                ->pluck('user_id');

            // Create notifications for each student
            foreach ($enrolledStudents as $studentId) {
                \Illuminate\Support\Facades\DB::table('notifications')->insert([
                    'id' => \Illuminate\Support\Str::uuid(),
                    'type' => 'App\Notifications\GenericNotification',
                    'notifiable_type' => 'App\Models\User',
                    'notifiable_id' => $studentId,
                    'data' => json_encode([
                        'title' => 'New Virtual Class Scheduled',
                        'message' => "A new virtual class '{$virtualClass->title}' has been scheduled for " . 
                                    Carbon::parse($virtualClass->scheduled_at)->format('M d, Y \a\t h:i A'),
                        'type' => 'academic',
                        'virtual_class_id' => $virtualClass->id,
                        'course_id' => $virtualClass->course_id,
                        'scheduled_at' => $virtualClass->scheduled_at,
                    ]),
                    'read_at' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        } catch (\Throwable $e) {
            // Log error but don't fail the class creation
            \Log::error('Failed to send virtual class notifications: ' . $e->getMessage());
        }
    }

    /**
     * Start a class (Lecturers only).
     */
    public function startClass(Request $request, $id)
    {
        $virtualClass = VirtualClass::findOrFail($id);
        
        if ($request->user()->id !== $virtualClass->lecturer_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $virtualClass->update(['status' => 'active']);

        return response()->json([
            'message' => 'Class is now live',
            'virtual_class' => $virtualClass
        ]);
    }

    /**
     * Join a class and mark attendance.
     */
    public function joinClass(Request $request, $id)
    {
        $virtualClass = VirtualClass::findOrFail($id);
        $user = $request->user();

        // Check if class is active
        if ($virtualClass->status !== 'active') {
            return response()->json([
                'message' => 'This class is not currently active'
            ], 400);
        }

        // Register or update attendance
        $attendance = Attendance::updateOrCreate(
            [
                'virtual_class_id' => $virtualClass->id,
                'user_id' => $user->id,
            ],
            [
                'joined_at' => now(),
                'status' => 'present',
            ]
        );

        // Get total participants count
        $participantsCount = Attendance::where('virtual_class_id', $virtualClass->id)->count();

        return response()->json([
            'message' => 'Joined class successfully',
            'meeting_link' => $virtualClass->meeting_link,
            'virtual_class' => $virtualClass,
            'participants_count' => $participantsCount,
        ]);
    }

    /**
     * End a class (Lecturers only).
     */
    public function endClass(Request $request, $id)
    {
        $virtualClass = VirtualClass::findOrFail($id);
        
        if ($request->user()->id !== $virtualClass->lecturer_id && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $virtualClass->update(['status' => 'ended']);

        // Mark end time for all students who forgot to leave? 
        // Or just mark it as ended.

        return response()->json([
            'message' => 'Class has ended',
            'virtual_class' => $virtualClass
        ]);
    }

    /**
     * Mark attendance for a student
     */
    public function markAttendance(Request $request, $id)
    {
        $virtualClass = VirtualClass::findOrFail($id);
        $user = $request->user();

        // Register attendance
        $attendance = Attendance::firstOrCreate([
            'virtual_class_id' => $virtualClass->id,
            'user_id' => $user->id,
        ], [
            'joined_at' => now(),
            'status' => 'present',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Attendance marked successfully',
            'data' => $attendance
        ]);
    }

    /**
     * Get specific virtual class details
     */
    public function show(Request $request, $id)
    {
        $virtualClass = VirtualClass::with(['course', 'lecturer:id,surname,first_name'])
            ->findOrFail($id);

        $virtualClass->lecturer_name = $virtualClass->lecturer 
            ? $virtualClass->lecturer->first_name . ' ' . $virtualClass->lecturer->surname 
            : 'N/A';

        return response()->json($virtualClass);
    }
    /**
     * Get chat messages for a virtual class
     */
    public function getChat($id)
    {
        $messages = VirtualClassMessage::where('virtual_class_id', $id)
            ->with('user:id,first_name,surname')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'user_name' => $msg->user->first_name . ' ' . $msg->user->surname,
                    'message' => $msg->message,
                    'timestamp' => $msg->created_at->format('H:i'),
                    'is_lecturer' => $msg->is_lecturer,
                ];
            });

        return response()->json(['messages' => $messages]);
    }

    /**
     * Post a chat message
     */
    public function postChat(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string',
        ]);

        $virtualClass = VirtualClass::findOrFail($id);
        $user = $request->user();

        // Check if chat is muted and user is not moderator (lecturer/admin)
        if ($virtualClass->is_chat_muted && $user->role !== 'lecturer' && $user->role !== 'admin') {
            return response()->json(['message' => 'The classroom chat has been muted by the moderator.'], 403);
        }

        $message = VirtualClassMessage::create([
            'virtual_class_id' => $id,
            'user_id' => $user->id,
            'message' => $request->message,
            'is_lecturer' => $user->role === 'lecturer' || $user->role === 'admin',
        ]);

        return response()->json(['message' => 'Message sent', 'data' => $message]);
    }

    /**
     * Toggle raise hand status
     */
    public function raiseHand(Request $request, $id)
    {
        $attendance = Attendance::where('virtual_class_id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        $attendance->is_hand_raised = !$attendance->is_hand_raised;
        $attendance->save();

        return response()->json([
            'message' => $attendance->is_hand_raised ? 'Hand raised' : 'Hand lowered',
            'is_hand_raised' => $attendance->is_hand_raised
        ]);
    }

    /**
     * Toggle chat mute status (Lecturers/Admins only)
     */
    public function toggleChatMute(Request $request, $id)
    {
        $virtualClass = VirtualClass::findOrFail($id);
        
        if ($request->user()->role !== 'lecturer' && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $virtualClass->is_chat_muted = !$virtualClass->is_chat_muted;
        $virtualClass->save();

        return response()->json([
            'message' => $virtualClass->is_chat_muted ? 'Classroom chat has been muted' : 'Classroom chat has been unmuted',
            'is_chat_muted' => $virtualClass->is_chat_muted
        ]);
    }

    /**
     * Get participants/attendees for a virtual class
     */
    public function getParticipants(Request $request, $id)
    {
        $virtualClass = VirtualClass::findOrFail($id);
        
        // Check authorization (lecturer or admin)
        if ($request->user()->role !== 'lecturer' && $request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $participants = Attendance::where('virtual_class_id', $id)
            ->with('user:id,first_name,surname,email')
            ->get()
            ->map(function($attendance) {
                return [
                    'id' => $attendance->user->id,
                    'name' => $attendance->user->first_name . ' ' . $attendance->user->surname,
                    'email' => $attendance->user->email,
                    'joined_at' => $attendance->joined_at,
                    'status' => $attendance->status ?? 'present',
                    'is_hand_raised' => $attendance->is_hand_raised ?? false,
                ];
            });

        return response()->json([
            'total_participants' => $participants->count(),
            'participants' => $participants
        ]);
    }
}
