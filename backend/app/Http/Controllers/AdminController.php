<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Course;
use App\Models\Exam;
use App\Models\Association;
use App\Models\CourseRegistration;
use App\Models\VirtualClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if ($request->user() && $request->user()->role !== 'admin') {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
            return $next($request);
        });
    }

    /**
     * Get global statistics for the admin dashboard.
     */
    public function stats()
    {
        return response()->json([
            'users' => [
                'total' => User::count(),
                'students' => User::where('role', 'student')->count(),
                'lecturers' => User::where('role', 'lecturer')->count(),
                'admins' => User::where('role', 'admin')->count(),
                'blocked' => User::where('account_status', 'blocked')->count(),
            ],
            'academic' => [
                'courses' => Course::count(),
                'exams' => Exam::count(),
                'pending_registrations' => CourseRegistration::where('status', 'registered')->count(),
            ],
            'social' => [
                'associations' => Association::count(),
                'active_classes' => VirtualClass::where('status', 'scheduled')->count(),
            ]
        ]);
    }

    /**
     * List all users with pagination and filtering.
     */
    public function users(Request $request)
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('status')) {
            $query->where('account_status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('surname', 'LIKE', "%$search%")
                  ->orWhere('first_name', 'LIKE', "%$search%")
                  ->orWhere('email', 'LIKE', "%$search%")
                  ->orWhere('matric_number', 'LIKE', "%$search%");
            });
        }

        return response()->json($query->latest()->paginate(20));
    }

    /**
     * Toggle user account status.
     */
    public function updateUserStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'status' => 'required|in:active,blocked,pending'
        ]);

        $user->update(['account_status' => $request->status]);

        return response()->json([
            'message' => "User status updated to {$request->status}",
            'user' => $user
        ]);
    }

    /**
     * List course registrations that require approval.
     */
    public function pendingRegistrations()
    {
        $registrations = CourseRegistration::with(['user:id,surname,first_name,matric_number', 'course:id,title,course_code'])
            ->where('status', 'registered')
            ->get();

        return response()->json($registrations);
    }

    /**
     * Approve or Drop a specific course registration.
     */
    public function approveRegistration(Request $request, $id)
    {
        $registration = CourseRegistration::findOrFail($id);
        
        $request->validate([
            'status' => 'required|in:approved,dropped'
        ]);

        $registration->update(['status' => $request->status]);

        return response()->json([
            'message' => "Registration status updated to {$request->status}",
            'registration' => $registration
        ]);
    }

    /**
     * System Overview - Combined data for a detailed admin home view.
     */
    public function systemOverview()
    {
        return response()->json([
            'recent_users' => User::latest()->limit(5)->get(),
            'recent_registrations' => CourseRegistration::with(['user', 'course'])->latest()->limit(5)->get(),
            'active_virtual_classes' => VirtualClass::where('status', 'scheduled')->with('lecturer')->get(),
        ]);
    }
}
