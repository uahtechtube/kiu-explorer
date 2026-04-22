<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\StudentProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'surname' => 'required|string|max:255',
            'first_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            // Academic Validation
            'faculty_id' => 'required|exists:faculties,id',
            'department_id' => 'required|exists:departments,id',
            'programme_id' => 'required|exists:programmes,id',
            'academic_session_id' => 'required|exists:academic_sessions,id', 
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        DB::beginTransaction();

        try {
            // Handle profile image upload
            $imagePath = null;
            if ($request->has('passport_photograph') && $request->passport_photograph) {
                $imagePath = $this->uploadBase64Image($request->passport_photograph, 'profile-photos');
            }

            $user = User::create([
                'user_id' => 'KIU-' . strtoupper(uniqid()),
                'matric_number' => $request->matric_number,
                'surname' => $request->surname,
                'first_name' => $request->first_name,
                'other_names' => $request->other_names,
                'gender' => $request->gender,
                'dob' => $request->dob,
                'nationality' => $request->nationality,
                'state_of_origin' => $request->state_of_origin,
                'lga' => $request->lga,
                'passport_photograph' => $imagePath,
                'email' => $request->email,
                'phone_number' => $request->phone_number,
                'alternative_phone_number' => $request->alternative_phone_number,
                'residential_address' => $request->residential_address,
                'city' => $request->city,
                'state_of_residence' => $request->state_of_residence,
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'role' => 'student',
            ]);

            // Create Profile
            $profile = StudentProfile::create([
                'user_id' => $user->id,
                'faculty_id' => $request->faculty_id,
                'department_id' => $request->department_id,
                'programme_id' => $request->programme_id,
                'academic_session_id' => $request->academic_session_id,
                'level' => $request->level,
                'mode_of_study' => $request->mode_of_study,
                'admission_year' => $request->admission_year, 
                'entry_mode' => $request->entry_mode,
                'guardian_name' => $request->guardian_name,
                'guardian_relationship' => $request->guardian_relationship,
                'guardian_phone' => $request->guardian_phone,
                'guardian_email' => $request->guardian_email,
                'guardian_address' => $request->guardian_address,
            ]);

            DB::commit();

            // Reload user with relationships
            $user->load(['studentProfile.faculty', 'studentProfile.department', 'studentProfile.programme']);

            return response()->json([
                'message' => 'User registered successfully',
                'user' => $user,
                'token' => $user->createToken('auth_token')->plainTextToken
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Registration failed: ' . $e->getMessage()], 500);
        }
    }

    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid login details'], 401);
        }

        // Fetch user and load role-specific relationships
        $user = User::where('email', $request['email'])->first();
        
        // Prevent banned/blocked users from logging in
        if (in_array($user->account_status, ['blocked', 'suspended'])) {
            return response()->json([
                'message' => 'Your account has been suspended or blocked by administration. Please contact support.'
            ], 403);
        }
        
        // Load relationships based on role
        if ($user->role === 'student') {
            $user->load(['studentProfile.faculty', 'studentProfile.department', 'studentProfile.programme']);
        } elseif ($user->role === 'lecturer') {
            $user->load(['lecturerProfile']);
        }
        // Admin doesn't need additional profile relationships
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'surname' => 'sometimes|string|max:255',
            'first_name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $user->id,
            'phone_number' => 'sometimes|string|max:20',
            // Add other validations as needed
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        DB::beginTransaction();
        try {
            // Update User fields
            $user->update($request->only([
                'surname', 'first_name', 'other_names', 'gender', 'dob', 
                'nationality', 'state_of_origin', 'lga', 'phone_number', 
                'alternative_phone_number', 'residential_address', 'city', 
                'state_of_residence', 'username'
            ]));

            // Update Student Profile fields if exists
            if ($user->role === 'student' && $user->studentProfile) {
                $user->studentProfile->update($request->only([
                    'level', 'mode_of_study', 'admission_year', 'entry_mode',
                    'guardian_name', 'guardian_relationship', 'guardian_phone',
                    'guardian_email', 'guardian_address'
                ]));
            }

            DB::commit();
            
            // Reload user with role-specific relationships
            if ($user->role === 'student') {
                $user->load(['studentProfile.faculty', 'studentProfile.department', 'studentProfile.programme']);
            } elseif ($user->role === 'lecturer') {
                $user->load(['lecturerProfile']);
            }
            
            return response()->json([
                'message' => 'Profile updated successfully',
                'user' => $user
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Update failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Upload profile image
     */
    public function uploadProfileImage(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        try {
            $user = $request->user();
            
            // Delete old image if exists
            if ($user->passport_photograph && \Storage::exists($user->passport_photograph)) {
                \Storage::delete($user->passport_photograph);
            }

            // Upload new image
            $imagePath = $this->uploadBase64Image($request->image, 'profile-photos');
            
            $user->update(['passport_photograph' => $imagePath]);
            
            // Reload user with role-specific relationships
            if ($user->role === 'student') {
                $user->load(['studentProfile.faculty', 'studentProfile.department', 'studentProfile.programme']);
            } elseif ($user->role === 'lecturer') {
                $user->load(['lecturerProfile']);
            }

            return response()->json([
                'message' => 'Profile image updated successfully',
                'user' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Image upload failed: ' . $e->getMessage()], 500);
        }
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
