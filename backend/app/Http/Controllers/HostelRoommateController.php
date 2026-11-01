<?php

namespace App\Http\Controllers;

use App\Models\HostelRoommateProfile;
use App\Models\HostelBooking;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HostelRoommateController extends Controller
{
    public function getProfile(Request $request)
    {
        $user = $request->user();
        $profile = HostelRoommateProfile::where('student_id', $user->id)->first();

        return response()->json([
            'status' => 'success',
            'data' => $profile
        ]);
    }

    public function saveProfile(Request $request)
    {
        $request->validate([
            'sleep_habit' => 'required|in:early_bird,night_owl,flexible',
            'study_habit' => 'required|in:quiet,light_music,group',
            'cleanliness' => 'required|in:neat_freak,moderate,relaxed',
            'social_habit' => 'required|in:introvert,extrovert,balanced',
            'bio' => 'nullable|string|max:500',
            'interests' => 'nullable|string|max:255', // comma separated list
        ]);

        $user = $request->user();

        $profile = HostelRoommateProfile::updateOrCreate(
            ['student_id' => $user->id],
            $request->only(['sleep_habit', 'study_habit', 'cleanliness', 'social_habit', 'bio', 'interests'])
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Roommate matching profile updated successfully.',
            'data' => $profile
        ]);
    }

    public function getMatches(Request $request)
    {
        $user = $request->user();
        
        // Find current student's approved hostel booking
        $booking = HostelBooking::where('student_id', $user->id)
            ->where('status', 'approved')
            ->first();

        if (!$booking) {
            return response()->json([
                'status' => 'error',
                'message' => 'You must have an approved hostel booking to find compatible roommates.'
            ], 403);
        }

        $myHostelId = $booking->room->hostel_id;
        $myProfile = HostelRoommateProfile::where('student_id', $user->id)->first();

        if (!$myProfile) {
            return response()->json([
                'status' => 'error',
                'message' => 'Please set up your roommate matching profile first.'
            ], 400);
        }

        // Get all other students with approved bookings in the same hostel who have roommate profiles
        $otherBookings = HostelBooking::with(['student.roommateProfile', 'room'])
            ->where('status', 'approved')
            ->where('student_id', '!=', $user->id)
            ->whereHas('room', function($query) use ($myHostelId) {
                $query->where('hostel_id', $myHostelId);
            })
            ->get();

        $matches = [];

        foreach ($otherBookings as $ob) {
            $otherStudent = $ob->student;
            if (!$otherStudent || !$otherStudent->roommateProfile) {
                continue;
            }

            $op = $otherStudent->roommateProfile;
            $score = 0;
            $maxScore = 40; // 4 attributes x 10 points

            if ($myProfile->sleep_habit === $op->sleep_habit) $score += 10;
            if ($myProfile->study_habit === $op->study_habit) $score += 10;
            if ($myProfile->cleanliness === $op->cleanliness) $score += 10;
            if ($myProfile->social_habit === $op->social_habit) $score += 10;

            $matchPercentage = round(($score / $maxScore) * 100);

            $matches[] = [
                'student_id' => $otherStudent->id,
                'name' => trim($otherStudent->first_name . ' ' . $otherStudent->surname),
                'matric_number' => $otherStudent->matric_number,
                'gender' => $otherStudent->gender,
                'email' => $otherStudent->email,
                'phone_number' => $otherStudent->phone_number,
                'room_number' => $ob->room->room_number ?? 'N/A',
                'match_percentage' => $matchPercentage,
                'profile' => [
                    'sleep_habit' => $op->sleep_habit,
                    'study_habit' => $op->study_habit,
                    'cleanliness' => $op->cleanliness,
                    'social_habit' => $op->social_habit,
                    'bio' => $op->bio,
                    'interests' => $op->interests,
                ]
            ];
        }

        // Sort matches by percentage descending
        usort($matches, function($a, $b) {
            return $b['match_percentage'] <=> $a['match_percentage'];
        });

        return response()->json([
            'status' => 'success',
            'data' => $matches
        ]);
    }
}
