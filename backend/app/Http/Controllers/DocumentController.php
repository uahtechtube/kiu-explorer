<?php

namespace App\Http\Controllers;

use App\Models\StudentDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    /**
     * List student documents
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Students can only see their own documents
        $studentId = $user->isStudent() ? $user->id : $request->student_id;
        
        if (!$studentId) {
            return response()->json(['message' => 'Student ID required.'], 400);
        }

        $documents = StudentDocument::where('student_id', $studentId)
            ->with('verifier:id,surname,first_name')
            ->get();

        return response()->json($documents);
    }

    /**
     * Upload document
     */
    public function upload(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:users,id',
            'document_type' => 'required|in:admission_letter,birth_certificate,olevel_result,id_card,passport,other',
            'document' => 'required|file|max:10240|mimes:pdf,jpg,jpeg,png', // 10MB max
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $file = $request->file('document');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('documents/students', $filename, 'public');

        $document = StudentDocument::create([
            'student_id' => $request->student_id,
            'document_type' => $request->document_type,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

        return response()->json([
            'message' => 'Document uploaded successfully.',
            'data' => $document
        ], 201);
    }

    /**
     * Download document
     */
    public function download($id)
    {
        $user = request()->user();
        $document = StudentDocument::findOrFail($id);

        // Only student owner or admin can download
        if (!$user->isAdmin() && $document->student_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $filePath = storage_path('app/public/' . $document->file_path);
        
        if (!file_exists($filePath)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        return response()->download($filePath, $document->file_name);
    }

    /**
     * Verify document (Admin only)
     */
    public function verify(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'is_verified' => 'required|boolean',
            'verification_notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $document = StudentDocument::findOrFail($id);

        $document->update([
            'is_verified' => $request->is_verified,
            'verified_by' => $request->user()->id,
            'verified_at' => now(),
            'verification_notes' => $request->verification_notes,
        ]);

        return response()->json([
            'message' => 'Document verification updated successfully.',
            'data' => $document->load('verifier:id,surname,first_name')
        ]);
    }

    /**
     * Delete document
     */
    public function destroy($id)
    {
        $user = request()->user();
        $document = StudentDocument::findOrFail($id);

        // Only student owner or admin can delete
        if (!$user->isAdmin() && $document->student_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Delete file from storage
        if ($document->file_path) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return response()->json(['message' => 'Document deleted successfully.']);
    }
}
