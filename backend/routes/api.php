<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AcademicController;
use App\Http\Controllers\LecturerController;
use App\Http\Controllers\CourseController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public Academic Data
Route::get('/faculties', [AcademicController::class, 'getFaculties']);
Route::get('/faculties/{id}/departments', [AcademicController::class, 'getDepartments']);
Route::get('/departments/{id}/programmes', [AcademicController::class, 'getProgrammes']);
Route::get('/academic-sessions', [AcademicController::class, 'getSessions']);

// Protected Routes
Route::middleware(['auth:sanctum'])->group(function () {
    
    // User Info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::patch('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/profile/upload-image', [AuthController::class, 'uploadProfileImage']);

    // Admin & Lecturer Operations
    Route::post('/admin/create-lecturer', [\App\Http\Controllers\AdminController::class, 'createLecturer']);
    Route::post('/admin/allocations', [\App\Http\Controllers\AllocationController::class, 'store']);
    Route::get('/admin/allocations', [\App\Http\Controllers\AllocationController::class, 'index']);
    
    // Course Management
    Route::get('/courses', [\App\Http\Controllers\CourseController::class, 'index']);
    Route::post('/courses', [\App\Http\Controllers\CourseController::class, 'store']); 
    Route::post('/courses/enroll', [\App\Http\Controllers\CourseController::class, 'enroll']); 

    // Tutorials
    Route::get('/tutorials', [\App\Http\Controllers\TutorialController::class, 'index']);
    Route::post('/tutorials', [\App\Http\Controllers\TutorialController::class, 'store']);

    // Virtual Classes & E-Classroom
    Route::get('/virtual-classes', [\App\Http\Controllers\VirtualClassController::class, 'index']);
    Route::post('/virtual-classes', [\App\Http\Controllers\VirtualClassController::class, 'store']);
    Route::post('/virtual-classes/{id}/start', [\App\Http\Controllers\VirtualClassController::class, 'startClass']);
    Route::post('/virtual-classes/{id}/join', [\App\Http\Controllers\VirtualClassController::class, 'joinClass']);
    Route::post('/virtual-classes/{id}/end', [\App\Http\Controllers\VirtualClassController::class, 'endClass']);

    // Student Dashboard
    Route::get('/student/dashboard', [\App\Http\Controllers\StudentDashboardController::class, 'home']);

    // E-Exams & Assessment
    Route::get('/exams', [\App\Http\Controllers\ExamController::class, 'index']);
    Route::post('/exams', [\App\Http\Controllers\ExamController::class, 'store']);
    Route::post('/exams/{id}/questions', [\App\Http\Controllers\ExamController::class, 'addQuestions']);
    Route::post('/exams/{id}/start', [\App\Http\Controllers\ExamController::class, 'startAttempt']);
    Route::post('/exams/attempts/{id}/submit', [\App\Http\Controllers\ExamController::class, 'submitAttempt']);

    // Settings
    Route::get('/settings', [\App\Http\Controllers\SettingsController::class, 'getSettings']);
    Route::post('/settings/notifications', [\App\Http\Controllers\SettingsController::class, 'updateNotifications']);
    Route::post('/settings/password', [\App\Http\Controllers\SettingsController::class, 'changePassword']);

    // Support
    Route::get('/support', [\App\Http\Controllers\SupportController::class, 'index']);
    Route::post('/support/tickets', [\App\Http\Controllers\SupportController::class, 'store']);

    // Student-Specific Routes (Consolidated)
    Route::prefix('student')->group(function () {
        // Search
        Route::get('/search', [\App\Http\Controllers\SearchController::class, 'search']);
        
        // Events
        Route::get('/events', [\App\Http\Controllers\EventController::class, 'index']);
        Route::get('/events/{id}', [\App\Http\Controllers\EventController::class, 'show']);
        Route::post('/events/{id}/register', [\App\Http\Controllers\EventController::class, 'register']);
        Route::post('/events/{id}/unregister', [\App\Http\Controllers\EventController::class, 'unregister']);
        Route::get('/events/my/registered', [\App\Http\Controllers\EventController::class, 'myEvents']);
        
        // Messages (alias to chats)
        Route::get('/messages', [\App\Http\Controllers\ChatController::class, 'index']);
        
        // Calendar (alias to school calendar)
        Route::get('/school/calendar', [\App\Http\Controllers\SchoolInfoController::class, 'getAcademicCalendar']);
        
        // Attendance
        Route::get('/attendance', [\App\Http\Controllers\AttendanceController::class, 'getStudentAttendance']);
        
        // Virtual Classes
        Route::get('/virtual-classes', [\App\Http\Controllers\VirtualClassController::class, 'index']);
        Route::get('/virtual-classes/{id}', [\App\Http\Controllers\VirtualClassController::class, 'show']);
        Route::post('/virtual-classes/{id}/join', [\App\Http\Controllers\VirtualClassController::class, 'joinClass']);
        Route::post('/virtual-classes/{id}/attendance', [\App\Http\Controllers\VirtualClassController::class, 'markAttendance']);
        Route::post('/virtual-classes/{id}/raise-hand', [\App\Http\Controllers\VirtualClassController::class, 'raiseHand']);
        
        // Notifications
        Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
        
        // Exams
        Route::get('/exams', [\App\Http\Controllers\ExamController::class, 'index']);
        Route::get('/exams/{id}', [\App\Http\Controllers\ExamController::class, 'show']);
        Route::get('/exams/{id}/questions', [\App\Http\Controllers\ExamController::class, 'getQuestions']);
        Route::post('/exams/{id}/start', [\App\Http\Controllers\ExamController::class, 'startAttempt']);
        Route::post('/exams/{id}/save-answer', [\App\Http\Controllers\ExamController::class, 'saveAnswer']);
        Route::post('/exams/{id}/submit', [\App\Http\Controllers\ExamController::class, 'submitAttempt']);
        
        // Associations
        Route::get('/associations', [\App\Http\Controllers\AssociationController::class, 'index']);
        Route::get('/associations/{id}', [\App\Http\Controllers\AssociationController::class, 'show']);
        Route::post('/associations/{id}/join', [\App\Http\Controllers\AssociationController::class, 'join']);
        Route::post('/associations/{id}/leave', [\App\Http\Controllers\AssociationController::class, 'leave']);
        Route::get('/associations/my/memberships', [\App\Http\Controllers\AssociationController::class, 'myAssociations']);
        Route::get('/associations/{id}/members', [\App\Http\Controllers\AssociationController::class, 'members']);
        
        // Practice Quizzes (Added to match frontend)
        Route::get('/practice-quizzes', [\App\Http\Controllers\QuizController::class, 'getPracticeData']);
    });
    Route::post('/events', [\App\Http\Controllers\EventController::class, 'store']);
    Route::put('/events/{id}', [\App\Http\Controllers\EventController::class, 'update']);
    Route::delete('/events/{id}', [\App\Http\Controllers\EventController::class, 'destroy']);

    // Associations Management (Admin/Lecturer)
    Route::post('/associations', [\App\Http\Controllers\AssociationController::class, 'store']);
    Route::put('/associations/{id}', [\App\Http\Controllers\AssociationController::class, 'update']);
    Route::delete('/associations/{id}', [\App\Http\Controllers\AssociationController::class, 'destroy']);

    // Social Hub
    Route::get('/posts', [\App\Http\Controllers\SocialController::class, 'index']);
    Route::post('/posts', [\App\Http\Controllers\SocialController::class, 'store']);
    Route::post('/posts/{id}/like', [\App\Http\Controllers\SocialController::class, 'like']);
    Route::post('/posts/{id}/comment', [\App\Http\Controllers\SocialController::class, 'comment']);

    // Communication & Utilities
    Route::get('/chats', [\App\Http\Controllers\ChatController::class, 'index']);
    Route::post('/chats', [\App\Http\Controllers\ChatController::class, 'startConversation']);
    Route::get('/chats/{id}/messages', [\App\Http\Controllers\ChatController::class, 'getMessages']);
    Route::post('/chats/{id}/messages', [\App\Http\Controllers\ChatController::class, 'sendMessage']);
    
    // Media messaging
    Route::get('/messages/{id}/media', [\App\Http\Controllers\ChatController::class, 'downloadMedia']);
    Route::delete('/messages/{id}/media', [\App\Http\Controllers\ChatController::class, 'deleteMedia']);

    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::get('/notifications/unread', [\App\Http\Controllers\NotificationController::class, 'unread']);
    Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);

    // Friend Requests
    Route::post('/friends/request', [\App\Http\Controllers\FriendController::class, 'sendRequest']);
    Route::post('/friends/requests/{id}/accept', [\App\Http\Controllers\FriendController::class, 'acceptRequest']);
    Route::post('/friends/requests/{id}/reject', [\App\Http\Controllers\FriendController::class, 'rejectRequest']);
    Route::get('/friends', [\App\Http\Controllers\FriendController::class, 'listFriends']);
    Route::get('/friends/requests', [\App\Http\Controllers\FriendController::class, 'listPendingRequests']);
    Route::delete('/friends/{id}', [\App\Http\Controllers\FriendController::class, 'unfriend']);

    // Groups
    Route::get('/groups', [\App\Http\Controllers\GroupController::class, 'index']);
    Route::post('/groups', [\App\Http\Controllers\GroupController::class, 'store']);
    Route::get('/groups/{id}', [\App\Http\Controllers\GroupController::class, 'show']);
    Route::post('/groups/{id}/join', [\App\Http\Controllers\GroupController::class, 'requestJoin']);
    Route::post('/groups/{id}/approve/{userId}', [\App\Http\Controllers\GroupController::class, 'approveJoinRequest']);
    Route::post('/groups/{id}/reject/{userId}', [\App\Http\Controllers\GroupController::class, 'rejectJoinRequest']);
    Route::get('/groups/{id}/members', [\App\Http\Controllers\GroupController::class, 'listMembers']);
    Route::post('/groups/{id}/leave', [\App\Http\Controllers\GroupController::class, 'leave']);

    // School Information
    Route::get('/school/info', [\App\Http\Controllers\SchoolInfoController::class, 'getSchoolInfo']);
    Route::put('/school/info', [\App\Http\Controllers\SchoolInfoController::class, 'updateSchoolInfo']); // Admin
    Route::get('/school/rules', [\App\Http\Controllers\SchoolInfoController::class, 'getRules']);
    Route::post('/school/rules', [\App\Http\Controllers\SchoolInfoController::class, 'storeRule']); // Admin
    Route::put('/school/rules/{id}', [\App\Http\Controllers\SchoolInfoController::class, 'updateRule']); // Admin
    Route::delete('/school/rules/{id}', [\App\Http\Controllers\SchoolInfoController::class, 'deleteRule']); // Admin
    Route::get('/school/staff', [\App\Http\Controllers\SchoolInfoController::class, 'getStaffDirectory']);
    Route::get('/school/calendar', [\App\Http\Controllers\SchoolInfoController::class, 'getAcademicCalendar']);
    Route::post('/school/calendar', [\App\Http\Controllers\SchoolInfoController::class, 'storeCalendarEvent']); // Admin
    Route::put('/school/calendar/{id}', [\App\Http\Controllers\SchoolInfoController::class, 'updateCalendarEvent']); // Admin
    Route::delete('/school/calendar/{id}', [\App\Http\Controllers\SchoolInfoController::class, 'deleteCalendarEvent']); // Admin

    // Parent/Guardian Management
    Route::get('/parents', [\App\Http\Controllers\ParentGuardianController::class, 'index']);
    Route::post('/parents', [\App\Http\Controllers\ParentGuardianController::class, 'store']);
    Route::put('/parents/{id}', [\App\Http\Controllers\ParentGuardianController::class, 'update']);
    Route::delete('/parents/{id}', [\App\Http\Controllers\ParentGuardianController::class, 'destroy']);

    // Student Documents
    Route::get('/documents', [\App\Http\Controllers\DocumentController::class, 'index']);
    Route::post('/documents/upload', [\App\Http\Controllers\DocumentController::class, 'upload']);
    Route::get('/documents/{id}/download', [\App\Http\Controllers\DocumentController::class, 'download']);
    Route::post('/documents/{id}/verify', [\App\Http\Controllers\DocumentController::class, 'verify']); // Admin
    Route::delete('/documents/{id}', [\App\Http\Controllers\DocumentController::class, 'destroy']);

    // Announcements
    Route::get('/announcements', [\App\Http\Controllers\AnnouncementController::class, 'index']);
    Route::get('/announcements/urgent', [\App\Http\Controllers\AnnouncementController::class, 'urgent']);
    Route::get('/announcements/type/{type}', [\App\Http\Controllers\AnnouncementController::class, 'byType']);
    Route::get('/announcements/{id}', [\App\Http\Controllers\AnnouncementController::class, 'show']);
    Route::post('/announcements', [\App\Http\Controllers\AnnouncementController::class, 'store']); // Admin
    Route::put('/announcements/{id}', [\App\Http\Controllers\AnnouncementController::class, 'update']); // Admin
    Route::delete('/announcements/{id}', [\App\Http\Controllers\AnnouncementController::class, 'destroy']); // Admin

    // Digital Library
    Route::get('/library', [\App\Http\Controllers\LibraryController::class, 'index']);
    Route::get('/library/{id}', [\App\Http\Controllers\LibraryController::class, 'show']);
    Route::post('/library', [\App\Http\Controllers\LibraryController::class, 'store']); // Lecturer/Admin
    Route::get('/library/{id}/download', [\App\Http\Controllers\LibraryController::class, 'download']);
    Route::post('/library/{id}/approve', [\App\Http\Controllers\LibraryController::class, 'approve']); // Admin
    Route::delete('/library/{id}', [\App\Http\Controllers\LibraryController::class, 'destroy']); // Admin

    // Assignments
    Route::get('/assignments', [\App\Http\Controllers\AssignmentController::class, 'index']);
    Route::post('/assignments', [\App\Http\Controllers\AssignmentController::class, 'store']); // Lecturer
    Route::post('/assignments/{id}/submit', [\App\Http\Controllers\AssignmentController::class, 'submit']); // Student
    Route::post('/submissions/{id}/grade', [\App\Http\Controllers\AssignmentController::class, 'grade']); // Lecturer
    Route::get('/assignments/{id}/submissions', [\App\Http\Controllers\AssignmentController::class, 'getSubmissions']); // Lecturer

    // Campus Map
    Route::get('/campus/locations', [\App\Http\Controllers\CampusController::class, 'index']);
    Route::get('/campus/emergency', [\App\Http\Controllers\CampusController::class, 'emergencyPoints']);
    Route::post('/campus/locations', [\App\Http\Controllers\CampusController::class, 'store']); // Admin
    Route::put('/campus/locations/{id}', [\App\Http\Controllers\CampusController::class, 'update']); // Admin
    Route::delete('/campus/locations/{id}', [\App\Http\Controllers\CampusController::class, 'destroy']); // Admin

    // Attendance
    Route::post('/attendance/mark', [\App\Http\Controllers\AttendanceController::class, 'mark']); // Admin/Lecturer
    Route::get('/attendance/student', [\App\Http\Controllers\AttendanceController::class, 'getStudentAttendance']);
    Route::get('/attendance/statistics', [\App\Http\Controllers\AttendanceController::class, 'getStatistics']);
    Route::get('/attendance/report', [\App\Http\Controllers\AttendanceController::class, 'getReport']); // Admin/Lecturer

    // Practice Quizzes
    Route::get('/quizzes', [\App\Http\Controllers\QuizController::class, 'index']);
    Route::post('/quizzes', [\App\Http\Controllers\QuizController::class, 'store']); // Lecturer
    Route::post('/quizzes/{id}/start', [\App\Http\Controllers\QuizController::class, 'start']); // Student
    Route::post('/quiz-attempts/{id}/submit', [\App\Http\Controllers\QuizController::class, 'submit']); // Student
    Route::get('/quiz-attempts/{id}/results', [\App\Http\Controllers\QuizController::class, 'results']); // Student

    // Association Polls
    Route::get('/polls', [\App\Http\Controllers\PollController::class, 'index']);
    Route::post('/polls', [\App\Http\Controllers\PollController::class, 'store']); // Association Executive
    Route::post('/polls/{id}/vote', [\App\Http\Controllers\PollController::class, 'vote']);
    Route::get('/polls/{id}/results', [\App\Http\Controllers\PollController::class, 'results']);
    Route::post('/polls/{id}/close', [\App\Http\Controllers\PollController::class, 'close']); // Creator/Admin

    // Student Progress Analytics
    Route::get('/progress/academic', [\App\Http\Controllers\StudentProgressController::class, 'getAcademicProgress']);
    Route::get('/progress/course/{courseId}', [\App\Http\Controllers\StudentProgressController::class, 'getCourseProgress']);
    Route::get('/progress/comparison/{courseId}', [\App\Http\Controllers\StudentProgressController::class, 'getComparisonStats']);

    // Lecturer Analytics
    Route::prefix('lecturer')->group(function () {
        Route::get('/performance', [\App\Http\Controllers\LecturerController::class, 'getClassPerformance']);
        Route::get('/student-progress/{courseId}/{studentId}', [\App\Http\Controllers\LecturerController::class, 'getStudentProgress']);
        Route::get('/attendance-report/{courseId}', [\App\Http\Controllers\LecturerController::class, 'getAttendanceReport']);
        Route::get('/exam-stats', [\App\Http\Controllers\LecturerController::class, 'getExamStatistics']);
    });

    // Reporting System
    Route::prefix('reports')->group(function () {
        Route::get('/academic/{studentId?}', [\App\Http\Controllers\ReportController::class, 'generateAcademicReport']);
        Route::get('/attendance/{studentId?}', [\App\Http\Controllers\ReportController::class, 'generateAttendanceReport']);
        Route::get('/system-usage', [\App\Http\Controllers\ReportController::class, 'generateSystemUsageReport']); // Admin only
    });

    // Admin Panel Logic
    Route::prefix('admin')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\AdminController::class, 'stats']);
        Route::get('/overview', [\App\Http\Controllers\AdminController::class, 'systemOverview']);
        Route::get('/users', [\App\Http\Controllers\AdminController::class, 'users']);
        Route::patch('/users/{id}/status', [\App\Http\Controllers\AdminController::class, 'updateUserStatus']);
        Route::get('/registrations/pending', [\App\Http\Controllers\AdminController::class, 'pendingRegistrations']);
        Route::patch('/registrations/{id}/approve', [\App\Http\Controllers\AdminController::class, 'approveRegistration']);
    });

    // AI Study Assistant
    Route::prefix('student/ai-assistant')->group(function () {
        Route::post('/chat', [\App\Http\Controllers\AIController::class, 'chat']);
        Route::get('/topics', [\App\Http\Controllers\AIController::class, 'topics']);
    });
});

