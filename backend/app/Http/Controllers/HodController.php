<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Programme;
use App\Models\Course;
use App\Models\Post;
use App\Models\Comment;
use App\Models\Tutorial;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class HodController extends Controller
{
    /**
     * Get statistics for the HOD's Department.
     */
    public function stats(Request $request)
    {
        $hod = $request->user();
        if ($hod->role !== 'hod' && $hod->role !== 'admin' && $hod->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $deptId = $hod->department_id;
        if (!$deptId) {
            return response()->json(['error' => 'HOD is not assigned to a Department.'], 400);
        }

        $lecturerCount = User::where('role', 'lecturer')->where('department_id', $deptId)->count();
        $tutorCount = User::where('role', 'tutor')->where('department_id', $deptId)->count();
        $studentCount = User::where('role', 'student')->where('department_id', $deptId)->count();
        $programmeCount = Programme::where('department_id', $deptId)->count();
        $courseCount = Course::where('department_id', $deptId)->count();

        return response()->json([
            'department_id' => $deptId,
            'stats' => [
                'lecturers' => $lecturerCount,
                'tutors' => $tutorCount,
                'students' => $studentCount,
                'programmes' => $programmeCount,
                'courses' => $courseCount,
                'total_staff' => $lecturerCount + $tutorCount
            ]
        ], 200);
    }

    /**
     * Create a Lecturer or Tutor in the HOD's Department.
     */
    public function createUser(Request $request)
    {
        $hod = $request->user();
        if ($hod->role !== 'hod' && $hod->role !== 'admin' && $hod->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $deptId = $hod->department_id;
        $facultyId = $hod->faculty_id;
        if (!$deptId) {
            return response()->json(['error' => 'HOD is not assigned to a Department.'], 400);
        }

        $validator = Validator::make($request->all(), [
            'surname' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'role' => 'required|in:lecturer,tutor'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        DB::beginTransaction();
        try {
            $user = User::create([
                'user_id' => 'KIU-' . strtoupper(uniqid()),
                'surname' => $request->surname,
                'first_name' => $request->first_name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
                'faculty_id' => $facultyId,
                'department_id' => $deptId,
                'account_status' => 'active'
            ]);

            $user->lecturerProfile()->create([
                'department_id' => $deptId,
            ]);

            DB::commit();

            return response()->json([
                'message' => ucfirst($request->role) . ' created successfully.',
                'user' => $user
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create user: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Create a Programme in HOD's Department.
     */
    public function createProgramme(Request $request)
    {
        $hod = $request->user();
        if ($hod->role !== 'hod' && $hod->role !== 'admin' && $hod->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $deptId = $hod->department_id;
        if (!$deptId) {
            return response()->json(['error' => 'HOD is not assigned to a Department.'], 400);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'degree_type' => 'nullable|string|max:255',
            'duration' => 'nullable|string|max:255',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $programme = Programme::create([
            'department_id' => $deptId,
            'name' => $request->name,
            'degree_type' => $request->degree_type,
            'duration' => $request->duration,
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Programme created successfully.',
            'programme' => $programme
        ], 201);
    }

    /**
     * Create a Course in HOD's Department.
     */
    public function createCourse(Request $request)
    {
        $hod = $request->user();
        if ($hod->role !== 'hod' && $hod->role !== 'admin' && $hod->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $deptId = $hod->department_id;
        if (!$deptId) {
            return response()->json(['error' => 'HOD is not assigned to a Department.'], 400);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|unique:courses,code|max:10',
            'title' => 'required|string|max:255',
            'unit' => 'required|integer|min:1',
            'level' => 'required|string|in:100,200,300,400,500',
            'semester' => 'required|string|in:First,Second',
            'description' => 'nullable|string',
            'is_elective' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $course = Course::create([
            'department_id' => $deptId,
            'code' => strtoupper($request->code),
            'title' => $request->title,
            'unit' => $request->unit,
            'level' => $request->level,
            'semester' => $request->semester,
            'description' => $request->description,
            'is_elective' => $request->is_elective ?? false,
        ]);

        return response()->json([
            'message' => 'Course created successfully.',
            'course' => $course
        ], 201);
    }

    /**
     * View all social posts from users within the HOD's Department.
     */
    public function getDepartmentFeed(Request $request)
    {
        $hod = $request->user();
        if ($hod->role !== 'hod' && $hod->role !== 'admin' && $hod->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $deptId = $hod->department_id;
        if (!$deptId) {
            return response()->json(['error' => 'HOD is not assigned to a Department.'], 400);
        }

        $posts = Post::whereHas('user', function ($q) use ($deptId) {
            $q->where('department_id', $deptId);
        })->with(['user', 'comments.user'])->latest()->paginate(15);

        return response()->json($posts, 200);
    }

    /**
     * Moderate (delete) inappropriate posts in their department.
     */
    public function deletePost(Request $request, $id)
    {
        $hod = $request->user();
        if ($hod->role !== 'hod' && $hod->role !== 'admin' && $hod->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $post = Post::findOrFail($id);

        // Verify scope - HOD can delete if user belongs to their department
        if ($hod->role === 'hod' && $post->user->department_id !== $hod->department_id) {
            return response()->json(['error' => 'Unauthorized. Post belongs to another department.'], 403);
        }

        $post->delete();

        return response()->json(['message' => 'Post moderated and deleted successfully.'], 200);
    }

    /**
     * Moderate (delete) inappropriate comments in their department.
     */
    public function deleteComment(Request $request, $id)
    {
        $hod = $request->user();
        if ($hod->role !== 'hod' && $hod->role !== 'admin' && $hod->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $comment = Comment::findOrFail($id);

        // Verify scope
        if ($hod->role === 'hod' && $comment->user->department_id !== $hod->department_id) {
            return response()->json(['error' => 'Unauthorized. Comment belongs to another department.'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment moderated and deleted successfully.'], 200);
    }
}
