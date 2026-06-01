<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Exam;
use App\Models\VirtualClass;
use App\Models\CourseRegistration;
use App\Services\NotificationService;
use Carbon\Carbon;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Console Task Scheduling
|--------------------------------------------------------------------------
*/

Schedule::call(function () {
    // 1. Virtual Classes starting in the next 30 minutes
    $upcomingClasses = VirtualClass::where('start_time', '>=', now())
        ->where('start_time', '<=', now()->addMinutes(30))
        ->get();

    foreach ($upcomingClasses as $class) {
        // Find registered students for the course
        $registrations = CourseRegistration::where('course_id', $class->course_id)
            ->with('student')
            ->get();

        $students = $registrations->pluck('student')->filter()->unique('id');

        foreach ($students as $student) {
            $cacheKey = "notified_class_{$class->id}_user_{$student->id}";
            if (!cache()->has($cacheKey)) {
                NotificationService::sendToUser(
                    $student,
                    "📚 Class Starting Soon",
                    "Your class '{$class->title}' is starting in 30 minutes at " . Carbon::parse($class->start_time)->format('h:i A') . ".",
                    ['type' => 'class_reminder', 'class_id' => $class->id]
                );
                cache()->put($cacheKey, true, now()->addHours(2));
            }
        }
    }

    // 2. Exams starting in the next 30 minutes
    $upcomingExams = Exam::where('start_time', '>=', now())
        ->where('start_time', '<=', now()->addMinutes(30))
        ->get();

    foreach ($upcomingExams as $exam) {
        // Find registered students for the course
        $registrations = CourseRegistration::where('course_id', $exam->course_id)
            ->with('student')
            ->get();

        $students = $registrations->pluck('student')->filter()->unique('id');

        foreach ($students as $student) {
            $cacheKey = "notified_exam_{$exam->id}_user_{$student->id}";
            if (!cache()->has($cacheKey)) {
                NotificationService::sendToUser(
                    $student,
                    "✍️ Exam Starting Soon",
                    "Your exam '{$exam->title}' is starting in 30 minutes at " . Carbon::parse($exam->start_time)->format('h:i A') . ".",
                    ['type' => 'exam_reminder', 'exam_id' => $exam->id]
                );
                cache()->put($cacheKey, true, now()->addHours(2));
            }
        }
    }
})->everyFiveMinutes();
