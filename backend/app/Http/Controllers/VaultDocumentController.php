<?php

namespace App\Http\Controllers;

use App\Models\VaultDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class VaultDocumentController extends Controller
{
    /**
     * List all vault documents for the student
     */
    public function index(Request $request)
    {
        $documents = VaultDocument::where('user_id', $request->user()->id)
            ->orderBy('is_pinned', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($documents);
    }

    /**
     * Store and encrypt a vault document
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'category' => 'required|string|in:admission_letter,registration,transcript,receipt,other',
            'document' => 'required|file|max:15360|mimes:pdf,jpg,jpeg,png,doc,docx', // Max 15MB
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $file = $request->file('document');
        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();

        // 1. Read raw contents
        $rawContents = file_get_contents($file->getRealPath());

        // 2. Encrypt contents
        $encryptedContents = Crypt::encrypt($rawContents);

        // 3. Save to private folder (outside public dir)
        $filename = Str::uuid() . '.enc';
        $path = 'vault/' . $filename;
        Storage::put($path, $encryptedContents);

        // 4. Create database record
        $document = VaultDocument::create([
            'user_id' => $request->user()->id,
            'title' => $request->title,
            'category' => $request->category,
            'file_name' => $originalName,
            'file_path' => $path,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'description' => $request->description,
            'is_pinned' => false,
            'is_encrypted' => true,
        ]);

        return response()->json([
            'message' => 'Document encrypted and saved in your secure vault.',
            'data' => $document
        ], 201);
    }

    /**
     * Update document metadata
     */
    public function update(Request $request, $id)
    {
        $document = VaultDocument::where('user_id', $request->user()->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|in:admission_letter,registration,transcript,receipt,other',
            'description' => 'nullable|string',
            'is_pinned' => 'sometimes|required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $document->update($request->only(['title', 'category', 'description', 'is_pinned']));

        return response()->json([
            'message' => 'Document details updated.',
            'data' => $document
        ]);
    }

    /**
     * Decrypt and download/serve the document
     */
    public function download(Request $request, $id)
    {
        $document = VaultDocument::where('user_id', $request->user()->id)->findOrFail($id);
        $path = $document->file_path;

        if (!Storage::exists($path)) {
            return response()->json(['message' => 'Physical file not found in storage.'], 404);
        }

        // 1. Get encrypted content
        $encryptedContents = Storage::get($path);

        try {
            // 2. Decrypt content
            $decryptedContents = Crypt::decrypt($encryptedContents);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to decrypt document. Integrity check failed.'], 500);
        }

        // 3. Serve the file directly
        return response($decryptedContents)
            ->header('Content-Type', $document->mime_type)
            ->header('Content-Length', strlen($decryptedContents))
            ->header('Content-Disposition', 'inline; filename="' . $document->file_name . '"');
    }

    /**
     * Delete document and remove physical file
     */
    public function destroy(Request $request, $id)
    {
        $document = VaultDocument::where('user_id', $request->user()->id)->findOrFail($id);

        // Delete from storage
        if (Storage::exists($document->file_path)) {
            Storage::delete($document->file_path);
        }

        $document->delete();

        return response()->json([
            'message' => 'Document deleted from your vault.'
        ]);
    }

    /**
     * Verify login password to allow PIN reset/bypass
     */
    public function verifyPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        if (Hash::check($request->password, $request->user()->password)) {
            return response()->json([
                'success' => true,
                'message' => 'Password verified. You can now reset your vault PIN.'
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Incorrect password. Access denied.'
        ], 422);
    }
}
