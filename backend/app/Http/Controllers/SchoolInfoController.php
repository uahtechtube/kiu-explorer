<?php

namespace App\Http\Controllers;

use App\Models\SchoolInfo;
use App\Models\SchoolRule;
use App\Models\StaffDirectory;
use App\Models\AcademicCalendar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SchoolInfoController extends Controller
{
    /**
     * Get school information
     */
    public function getSchoolInfo()
    {
        $info = SchoolInfo::first();
        
        if (!$info) {
            return response()->json(['message' => 'School information not found.'], 404);
        }

        return response()->json($info);
    }

    /**
     * Update school information (Admin only)
     */
    public function updateSchoolInfo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'school_name' => 'sometimes|string|max:255',
            'background' => 'sometimes|string',
            'history' => 'sometimes|string',
            'vision' => 'sometimes|string',
            'mission' => 'sometimes|string',
            'core_values' => 'sometimes|string',
            'motto' => 'sometimes|string|max:255',
            'established_year' => 'sometimes|integer|min:1900|max:' . date('Y'),
            'address' => 'sometimes|string',
            'phone' => 'sometimes|string',
            'email' => 'sometimes|email',
            'website' => 'sometimes|url',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $info = SchoolInfo::first();
        
        if (!$info) {
            $info = SchoolInfo::create($request->all());
        } else {
            $info->update($request->all());
        }

        return response()->json([
            'message' => 'School information updated successfully.',
            'data' => $info
        ]);
    }

    /**
     * Get school rules
     */
    public function getRules(Request $request)
    {
        $query = SchoolRule::where('is_active', true);

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $rules = $query->orderBy('order')->orderBy('category')->get();

        return response()->json($rules);
    }

    /**
     * Create school rule (Admin only)
     */
    public function storeRule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'order' => 'sometimes|integer',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $rule = SchoolRule::create($request->all());

        return response()->json([
            'message' => 'Rule created successfully.',
            'data' => $rule
        ], 201);
    }

    /**
     * Update school rule (Admin only)
     */
    public function updateRule(Request $request, $id)
    {
        $rule = SchoolRule::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'category' => 'sometimes|string|max:255',
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'order' => 'sometimes|integer',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $rule->update($request->all());

        return response()->json([
            'message' => 'Rule updated successfully.',
            'data' => $rule
        ]);
    }

    /**
     * Delete school rule (Admin only)
     */
    public function deleteRule($id)
    {
        $rule = SchoolRule::findOrFail($id);
        $rule->delete();

        return response()->json(['message' => 'Rule deleted successfully.']);
    }

    /**
     * Get staff directory
     */
    public function getStaffDirectory(Request $request)
    {
        $query = StaffDirectory::with(['faculty', 'department'])
            ->where('is_active', true);

        if ($request->has('faculty_id')) {
            $query->where('faculty_id', $request->faculty_id);
        }

        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->has('position')) {
            $query->where('position', 'like', '%' . $request->position . '%');
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('surname', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('staff_id', 'like', "%{$search}%");
            });
        }

        $staff = $query->orderBy('surname')->paginate(20);

        return response()->json($staff);
    }

    /**
     * Get academic calendar
     */
    public function getAcademicCalendar(Request $request)
    {
        $query = AcademicCalendar::where('is_public', true);

        if ($request->has('session')) {
            $query->where('academic_session', $request->session);
        }

        if ($request->has('semester')) {
            $query->where('semester', $request->semester);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('upcoming')) {
            $query->where('start_date', '>=', now());
        }

        $events = $query->orderBy('start_date')->get();

        return response()->json($events);
    }

    /**
     * Create calendar event (Admin only)
     */
    public function storeCalendarEvent(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'type' => 'required|in:exam,registration,break,resumption,event,deadline,other',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'academic_session' => 'required|string',
            'semester' => 'nullable|in:first,second',
            'color' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $event = AcademicCalendar::create($request->all());

        return response()->json([
            'message' => 'Calendar event created successfully.',
            'data' => $event
        ], 201);
    }

    /**
     * Update calendar event (Admin only)
     */
    public function updateCalendarEvent(Request $request, $id)
    {
        $event = AcademicCalendar::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'type' => 'sometimes|in:exam,registration,break,resumption,event,deadline,other',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'academic_session' => 'sometimes|string',
            'semester' => 'nullable|in:first,second',
            'color' => 'nullable|string',
            'is_public' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $event->update($request->all());

        return response()->json([
            'message' => 'Calendar event updated successfully.',
            'data' => $event
        ]);
    }

    /**
     * Delete calendar event (Admin only)
     */
    public function deleteCalendarEvent($id)
    {
        $event = AcademicCalendar::findOrFail($id);
        $event->delete();

        return response()->json(['message' => 'Calendar event deleted successfully.']);
    }
}
