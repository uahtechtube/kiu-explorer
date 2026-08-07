<?php

namespace App\Http\Controllers;

use App\Models\PopupAnnouncement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class AdminPopupAnnouncementController extends Controller
{
    /**
     * Get all active popup announcements (Public / Student access).
     */
    public function getActive()
    {
        $popups = PopupAnnouncement::where('is_active', true)->latest()->get();

        return response()->json($popups, 200);
    }

    /**
     * Get list of all popup announcements (Admin only).
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $popups = PopupAnnouncement::latest()->paginate(10);
        return response()->json($popups, 200);
    }

    /**
     * Create or update a popup announcement (Admin only).
     */
    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'body' => 'nullable|string',
            'image' => 'nullable|string',
            'video' => 'nullable|string',
            'image_file' => 'nullable|file|max:10240',
            'video_file' => 'nullable|file|max:51200',
            'is_active' => 'string|in:true,false,1,0'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        DB::beginTransaction();
        try {
            $isActive = $request->has('is_active')
                ? filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN)
                : false;

            // Multiple popups may be active at the same time (students see them as slides)

            $image = null;
            if ($request->hasFile('image_file')) {
                $image = $this->storeUploadedFile($request->file('image_file'), 'popup-media');
            } elseif ($request->image) {
                $image = $this->uploadBase64File($request->image, 'popup-media');
            }

            $video = null;
            if ($request->hasFile('video_file')) {
                $video = $this->storeUploadedFile($request->file('video_file'), 'popup-media');
            } elseif ($request->video) {
                $video = $this->uploadBase64File($request->video, 'popup-media');
            }

            $popup = PopupAnnouncement::create([
                'title' => $request->title,
                'body' => $request->body,
                'image' => $image,
                'video' => $video,
                'is_active' => $isActive,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Popup announcement configured successfully.',
                'popup' => $popup
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Action failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Toggle active state of a popup (Admin only).
     */
    public function toggleActive(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $popup = PopupAnnouncement::findOrFail($id);

        DB::beginTransaction();
        try {
            $newStatus = !$popup->is_active;

            // Multiple popups may be active at the same time (students see them as slides)

            $popup->update(['is_active' => $newStatus]);

            DB::commit();

            return response()->json([
                'message' => $newStatus ? 'Popup activated successfully.' : 'Popup deactivated successfully.',
                'popup' => $popup
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Action failed.'], 500);
        }
    }

    /**
     * Delete a popup announcement (Admin only).
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        if ($user->role !== 'admin' && $user->role !== 'management') {
            return response()->json(['error' => 'Unauthorized Access.'], 403);
        }

        $popup = PopupAnnouncement::findOrFail($id);
        $popup->delete();

        return response()->json(['message' => 'Popup announcement deleted successfully.'], 200);
    }

    /**
     * Store an uploaded file to public storage and return the relative URL path.
     */
    private function storeUploadedFile($file, $folder)
    {
        $extension = $file->getClientOriginalExtension();
        if (!$extension) {
            $extension = 'bin';
            $mime = $file->getMimeType();
            if ($mime === 'video/mp4') $extension = 'mp4';
            elseif ($mime === 'video/quicktime') $extension = 'mov';
            elseif ($mime === 'image/jpeg') $extension = 'jpg';
            elseif ($mime === 'image/png') $extension = 'png';
            elseif ($mime === 'image/webp') $extension = 'webp';
            elseif ($mime === 'image/gif') $extension = 'gif';
        }

        $fileName = uniqid() . '_' . time() . '.' . $extension;
        $path = $file->storeAs($folder, $fileName, 'public');

        return 'storage/' . $path;
    }

    /**
     * Save a base64 data URI (image/video) to public storage, or return the value untouched if it is already a URL/path.
     */
    private function uploadBase64File($dataUri, $folder)
    {
        if (strpos($dataUri, 'data:') !== 0) {
            return $dataUri;
        }

        preg_match('/^data:([a-zA-Z0-9.\/+-]+);base64,(.*)$/', $dataUri, $matches);
        if (!$matches || !isset($matches[2])) {
            return $dataUri;
        }

        $mime = $matches[1];
        $fileData = base64_decode($matches[2]);

        if ($fileData === false) {
            return $dataUri;
        }

        $extension = 'bin';
        if (strpos($mime, 'image/') === 0) {
            $extension = str_replace('image/', '', $mime);
        } elseif (strpos($mime, 'video/') === 0) {
            $extension = str_replace('video/', '', $mime);
        }

        $fileName = uniqid() . '_' . time() . '.' . $extension;
        $path = $folder . '/' . $fileName;

        \Storage::disk('public')->put($path, $fileData);

        return 'storage/' . $path;
    }
}
