<?php

namespace App\Http\Controllers;

use App\Models\ParentGuardian;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ParentGuardianController extends Controller
{
    /**
     * Get parent/guardian info for a student
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Students can only see their own parent info
        $studentId = $user->isStudent() ? $user->id : $request->student_id;
        
        if (!$studentId) {
            return response()->json(['message' => 'Student ID required.'], 400);
        }

        $parents = ParentGuardian::where('student_id', $studentId)->get();

        return response()->json($parents);
    }

    /**
     * Add parent/guardian information
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'full_name' => 'required|string|max:255',
            'relationship' => 'required|string|max:100',
            'phone_number' => 'required|string|max:20',
            'alternative_phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'occupation' => 'nullable|string|max:255',
            'is_primary' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // If setting as primary, unset other primary contacts
        if ($request->is_primary) {
            ParentGuardian::where('student_id', $request->student_id)
                ->update(['is_primary' => false]);
        }

        $parent = ParentGuardian::create($request->all());

        return response()->json([
            'message' => 'Parent/Guardian information added successfully.',
            'data' => $parent
        ], 201);
    }

    /**
     * Update parent/guardian information
     */
    public function update(Request $request, $id)
    {
        $parent = ParentGuardian::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'full_name' => 'sometimes|string|max:255',
            'relationship' => 'sometimes|string|max:100',
            'phone_number' => 'sometimes|string|max:20',
            'alternative_phone' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
            'occupation' => 'nullable|string|max:255',
            'is_primary' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // If setting as primary, unset other primary contacts
        if ($request->is_primary) {
            ParentGuardian::where('student_id', $parent->student_id)
                ->where('id', '!=', $id)
                ->update(['is_primary' => false]);
        }

        $parent->update($request->all());

        return response()->json([
            'message' => 'Parent/Guardian information updated successfully.',
            'data' => $parent
        ]);
    }

    /**
     * Delete parent/guardian information
     */
    public function destroy($id)
    {
        $parent = ParentGuardian::findOrFail($id);
        $parent->delete();

        return response()->json(['message' => 'Parent/Guardian information deleted successfully.']);
    }
}
