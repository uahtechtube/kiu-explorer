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
            $info = SchoolInfo::create([
                'school_name' => 'Kashim Ibrahim University',
                'motto' => 'Knowledge, Character, and Service',
                'established_year' => 2002,
                'address' => 'Kashim Ibrahim University Campus, Kano, Nigeria',
                'phone' => '+234 803 123 4567',
                'email' => 'info@kiu.edu.ng',
                'website' => 'https://kiu.edu.ng',
                'background' => 'Kashim Ibrahim University (KIU) is a premier institution dedicated to academic excellence, innovative research, and character building.',
                'history' => 'Founded to bridge the educational gap and foster technical and moral excellence in the region, Kashim Ibrahim University has grown into a world-class center of learning.',
                'vision' => 'To be a globally recognized center of academic excellence and societal transformation.',
                'mission' => 'To provide high-quality education, foster research-driven innovation, and produce graduates of outstanding character.',
                'core_values' => 'Integrity, Diligence, Innovation, and Excellence',
            ]);
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

    /**
     * Create staff directory profile (Admin only)
     */
    public function storeStaff(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'staff_id' => 'required|string|unique:staff_directory',
            'title' => 'required|string|max:50',
            'surname' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'position' => 'required|string|max:255',
            'faculty_id' => 'nullable|integer',
            'department_id' => 'nullable|integer',
            'department' => 'nullable|string|max:255',
            'office_location' => 'nullable|string|max:255',
            'email' => 'required|email|unique:staff_directory',
            'phone' => 'required|string|max:50',
            'photo_url' => 'nullable|string|max:2048',
            'photo' => 'nullable|string',
            'specialization' => 'nullable|string',
            'qualifications' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->all();

        // Handle passport photo upload
        if ($request->has('photo') && $request->photo) {
            try {
                $imagePath = $this->uploadBase64Image($request->photo, 'staff-photos');
                $data['photo_url'] = url($imagePath);
            } catch (\Exception $e) {
                // Ignore photo error or fallback
            }
        }

        if ($request->has('department')) {
            $deptName = trim($request->department);
            if ($deptName !== '') {
                $faculty = \App\Models\Faculty::first();
                if (!$faculty) {
                    $faculty = \App\Models\Faculty::create([
                        'name' => 'Faculty of Science',
                        'code' => 'SCI',
                        'description' => 'Default Faculty of Science'
                    ]);
                }
                $department = \App\Models\Department::firstOrCreate(
                    ['name' => $deptName],
                    ['faculty_id' => $faculty->id]
                );
                $data['department_id'] = $department->id;
                $data['faculty_id'] = $faculty->id;
            } else {
                $data['department_id'] = null;
                $data['faculty_id'] = null;
            }
        }

        $staff = StaffDirectory::create(array_merge($data, ['is_active' => true]));

        return response()->json([
            'message' => 'Staff profile created successfully.',
            'data' => $staff->load(['faculty', 'department'])
        ], 201);
    }

    /**
     * Update staff directory profile (Admin only)
     */
    public function updateStaff(Request $request, $id)
    {
        $staff = StaffDirectory::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'staff_id' => 'sometimes|required|string|unique:staff_directory,staff_id,' . $id,
            'title' => 'sometimes|required|string|max:50',
            'surname' => 'sometimes|required|string|max:255',
            'first_name' => 'sometimes|required|string|max:255',
            'other_names' => 'nullable|string|max:255',
            'position' => 'sometimes|required|string|max:255',
            'faculty_id' => 'nullable|integer',
            'department_id' => 'nullable|integer',
            'department' => 'nullable|string|max:255',
            'office_location' => 'nullable|string|max:255',
            'email' => 'sometimes|required|email|unique:staff_directory,email,' . $id,
            'phone' => 'sometimes|required|string|max:50',
            'photo_url' => 'nullable|string|max:2048',
            'photo' => 'nullable|string',
            'specialization' => 'nullable|string',
            'qualifications' => 'nullable|string',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $request->all();

        // Handle passport photo upload
        if ($request->has('photo') && $request->photo) {
            try {
                // Delete old photo if it exists on disk
                if ($staff->photo_url) {
                    $oldPath = str_replace(url('/'), '', $staff->photo_url);
                    $oldPath = ltrim(str_replace('storage/', '', $oldPath), '/');
                    if (\Storage::disk('public')->exists($oldPath)) {
                        \Storage::disk('public')->delete($oldPath);
                    }
                }
                
                $imagePath = $this->uploadBase64Image($request->photo, 'staff-photos');
                $data['photo_url'] = url($imagePath);
            } catch (\Exception $e) {
                // Ignore photo error or fallback
            }
        }

        if ($request->has('department')) {
            $deptName = trim($request->department);
            if ($deptName !== '') {
                $faculty = \App\Models\Faculty::first();
                if (!$faculty) {
                    $faculty = \App\Models\Faculty::create([
                        'name' => 'Faculty of Science',
                        'code' => 'SCI',
                        'description' => 'Default Faculty of Science'
                    ]);
                }
                $department = \App\Models\Department::firstOrCreate(
                    ['name' => $deptName],
                    ['faculty_id' => $faculty->id]
                );
                $data['department_id'] = $department->id;
                $data['faculty_id'] = $faculty->id;
            } else {
                $data['department_id'] = null;
                $data['faculty_id'] = null;
            }
        }

        $staff->update($data);

        return response()->json([
            'message' => 'Staff profile updated successfully.',
            'data' => $staff->load(['faculty', 'department'])
        ]);
    }

    /**
     * Delete staff directory profile (Admin only)
     */
    public function deleteStaff($id)
    {
        $staff = StaffDirectory::findOrFail($id);
        
        // Delete old photo if it exists on disk
        if ($staff->photo_url) {
            $oldPath = str_replace(url('/'), '', $staff->photo_url);
            $oldPath = ltrim(str_replace('storage/', '', $oldPath), '/');
            if (\Storage::disk('public')->exists($oldPath)) {
                \Storage::disk('public')->delete($oldPath);
            }
        }
        
        $staff->delete();

        return response()->json(['message' => 'Staff profile deleted successfully.']);
    }

    /**
     * Helper method to upload base64 image
     */
    private function uploadBase64Image($base64String, $folder = 'images')
    {
        // Check if it's a data URI or file path
        if (strpos($base64String, 'data:image') === 0) {
            // It's a base64 data URI
            $image = str_replace('data:image/', '', $base64String);
            $image = explode(';base64,', $image);
            $extension = $image[0];
            $imageData = base64_decode($image[1]);
        } elseif (strpos($base64String, 'file://') === 0 || strpos($base64String, '/') === 0) {
            // It's a file path - read the file
            $filePath = str_replace('file://', '', $base64String);
            if (file_exists($filePath)) {
                $imageData = file_get_contents($filePath);
                $extension = pathinfo($filePath, PATHINFO_EXTENSION);
            } else {
                throw new \Exception('Image file not found');
            }
        } else {
            // Assume it's raw base64
            $imageData = base64_decode($base64String);
            $extension = 'jpg'; // default
        }

        $fileName = uniqid() . '_' . time() . '.' . $extension;
        $path = $folder . '/' . $fileName;
        
        \Storage::disk('public')->put($path, $imageData);
        
        return 'storage/' . $path;
    }
}

