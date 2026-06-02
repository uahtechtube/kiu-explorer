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
    Route::post('/profile/push-token', [AuthController::class, 'updatePushToken']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Admin & Lecturer Operations
    Route::post('/admin/create-lecturer', [\App\Http\Controllers\AdminController::class, 'createLecturer']);
    Route::post('/admin/allocations', [\App\Http\Controllers\AllocationController::class, 'store']);
    Route::get('/admin/allocations', [\App\Http\Controllers\AllocationController::class, 'index']);
    
    // Course Management
    Route::get('/courses', [\App\Http\Controllers\CourseController::class, 'index']);
    Route::post('/courses', [\App\Http\Controllers\CourseController::class, 'store']); 
    Route::put('/courses/{id}', [\App\Http\Controllers\CourseController::class, 'update']);
    Route::delete('/courses/{id}', [\App\Http\Controllers\CourseController::class, 'destroy']);
    Route::post('/courses/enroll', [\App\Http\Controllers\CourseController::class, 'enroll']); 


    // Tutorials
    Route::get('/tutorials', [\App\Http\Controllers\TutorialController::class, 'index']);
    Route::get('/tutorials/{id}', [\App\Http\Controllers\TutorialController::class, 'show']);
    Route::post('/tutorials', [\App\Http\Controllers\TutorialController::class, 'store']);
    
    // YouTube Tutorial Routes
    Route::get('/tutorials/youtube/search', [\App\Http\Controllers\TutorialController::class, 'youtubeSearch']);
    Route::post('/tutorials/youtube/save', [\App\Http\Controllers\TutorialController::class, 'saveYoutube']);

    // Lecturer route alias for tutorial upload
    Route::post('/lecturer/tutorials', [\App\Http\Controllers\TutorialController::class, 'store']);
    Route::put('/lecturer/tutorials/{id}', [\App\Http\Controllers\TutorialController::class, 'update']);
    Route::delete('/lecturer/tutorials/{id}', [\App\Http\Controllers\TutorialController::class, 'destroy']);
    Route::patch('/lecturer/tutorials/{id}/ban', [\App\Http\Controllers\TutorialController::class, 'ban']);
    Route::post('/lecturer/tutorials/youtube/save', [\App\Http\Controllers\TutorialController::class, 'saveYoutube']);

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
    Route::get('/lecturer/exams', [\App\Http\Controllers\ExamController::class, 'lecturerExams']);
    Route::put('/lecturer/exams/{id}', [\App\Http\Controllers\ExamController::class, 'update']);
    Route::delete('/lecturer/exams/{id}', [\App\Http\Controllers\ExamController::class, 'destroy']);
    Route::get('/lecturer/exams/{id}/attempts-to-mark', [\App\Http\Controllers\ExamController::class, 'getAttemptsToMark']);
    Route::post('/lecturer/exams/attempts/{id}/grade', [\App\Http\Controllers\ExamController::class, 'gradeTheoryAttempt']);
    Route::post('/exams/{id}/questions', [\App\Http\Controllers\ExamController::class, 'addQuestions']);
    Route::post('/exams/{id}/start', [\App\Http\Controllers\ExamController::class, 'startAttempt']);
    Route::post('/exams/attempts/{id}/submit', [\App\Http\Controllers\ExamController::class, 'submitAttempt']);
    Route::post('/exams/attempts/{id}/force-submit', [\App\Http\Controllers\ExamController::class, 'forceSubmit']);
    Route::get('/exams/attempts/{id}/results', [\App\Http\Controllers\ExamController::class, 'getAttemptResults']);

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
        
        // Progress
        Route::get('/progress/academic', [\App\Http\Controllers\ProgressController::class, 'academic']);
        
        // Virtual Classes
        Route::get('/virtual-classes', [\App\Http\Controllers\VirtualClassController::class, 'index']);
        Route::get('/virtual-classes/{id}', [\App\Http\Controllers\VirtualClassController::class, 'show']);
        Route::post('/virtual-classes/{id}/join', [\App\Http\Controllers\VirtualClassController::class, 'joinClass']);
        Route::post('/virtual-classes/{id}/attendance', [\App\Http\Controllers\VirtualClassController::class, 'markAttendance']);
        Route::get('/virtual-classes/{id}/chat', [\App\Http\Controllers\VirtualClassController::class, 'getChat']);
        Route::post('/virtual-classes/{id}/chat', [\App\Http\Controllers\VirtualClassController::class, 'postChat']);
        Route::post('/virtual-classes/{id}/raise-hand', [\App\Http\Controllers\VirtualClassController::class, 'raiseHand']);
        
        // Notifications
        Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
        Route::post('/notifications/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
        Route::post('/notifications/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);
        Route::delete('/notifications/clear-all', [\App\Http\Controllers\NotificationController::class, 'clearAll']);
        
        // Exams
        Route::get('/exams', [\App\Http\Controllers\ExamController::class, 'index']);
        Route::get('/exams/{id}', [\App\Http\Controllers\ExamController::class, 'show']);
        Route::get('/exams/{id}/questions', [\App\Http\Controllers\ExamController::class, 'getQuestions']);
        Route::post('/exams/{id}/start', [\App\Http\Controllers\ExamController::class, 'startAttempt']);
        Route::post('/exams/{id}/save-answer', [\App\Http\Controllers\ExamController::class, 'saveAnswer']);
        Route::post('/exams/{id}/submit', [\App\Http\Controllers\ExamController::class, 'submitAttempt']);
        
        // Associations (Full Student CRUD & Approvals)
        Route::get('/associations', [\App\Http\Controllers\AssociationController::class, 'index']);
        Route::post('/associations', [\App\Http\Controllers\AssociationController::class, 'store']);
        Route::get('/associations/{id}', [\App\Http\Controllers\AssociationController::class, 'show']);
        Route::put('/associations/{id}', [\App\Http\Controllers\AssociationController::class, 'update']);
        Route::delete('/associations/{id}', [\App\Http\Controllers\AssociationController::class, 'destroy']);
        Route::post('/associations/{id}/join', [\App\Http\Controllers\AssociationController::class, 'join']);
        Route::post('/associations/{id}/leave', [\App\Http\Controllers\AssociationController::class, 'leave']);
        Route::get('/associations/my/memberships', [\App\Http\Controllers\AssociationController::class, 'myAssociations']);
        Route::get('/associations/{id}/members', [\App\Http\Controllers\AssociationController::class, 'members']);
        Route::get('/associations/{id}/requests', [\App\Http\Controllers\AssociationController::class, 'pendingRequests']);
        Route::post('/associations/{id}/requests/{userId}/approve', [\App\Http\Controllers\AssociationController::class, 'approveRequest']);
        Route::post('/associations/{id}/requests/{userId}/reject', [\App\Http\Controllers\AssociationController::class, 'rejectRequest']);
        Route::post('/associations/{id}/documents', [\App\Http\Controllers\AssociationController::class, 'addDocument']);
        Route::delete('/associations/{id}/documents/{docId}', [\App\Http\Controllers\AssociationController::class, 'deleteDocument']);
        
        // Practice Quizzes (Added to match frontend)
        Route::get('/practice-quizzes', [\App\Http\Controllers\QuizController::class, 'getPracticeData']);

        // Announcements (Added to match frontend)
        Route::get('/announcements', [\App\Http\Controllers\AnnouncementController::class, 'index']);
        Route::get('/announcements/{id}', [\App\Http\Controllers\AnnouncementController::class, 'show']);

        // Social Hub (Added to match frontend)
        Route::get('/posts', [\App\Http\Controllers\SocialController::class, 'index']);
        Route::post('/posts/{id}/like', [\App\Http\Controllers\SocialController::class, 'like']);
        
        // Course Registration
        Route::get('/courses', [\App\Http\Controllers\CourseController::class, 'index']);
        Route::post('/courses/register', [\App\Http\Controllers\CourseController::class, 'enroll']);
        Route::get('/courses/my-registrations', [\App\Http\Controllers\CourseController::class, 'myRegistrations']);
        
        
        // Payments
        Route::get('/payments', [\App\Http\Controllers\PaymentController::class, 'index']);
        Route::get('/payments/summary', [\App\Http\Controllers\PaymentController::class, 'summary']);
        Route::get('/payments/{id}', [\App\Http\Controllers\PaymentController::class, 'show']);
        Route::post('/payments/initiate', [\App\Http\Controllers\PaymentController::class, 'initiate']);
        Route::post('/payments/{reference}/resume', [\App\Http\Controllers\PaymentController::class, 'resume']);
        Route::get('/payments/{id}/receipt', [\App\Http\Controllers\PaymentController::class, 'downloadReceipt']);

        // Hostel Management — static routes MUST come before /{id} to avoid being swallowed
        Route::get('/hostels', [\App\Http\Controllers\HostelController::class, 'index']);
        Route::get('/hostels/my-bookings', [\App\Http\Controllers\BookingController::class, 'myBookings']);
        Route::post('/hostels/book', [\App\Http\Controllers\BookingController::class, 'store']);
        Route::post('/hostels/bookings/{id}/cancel', [\App\Http\Controllers\BookingController::class, 'cancel']);

        // Hostel Rules dynamic view
        Route::get('/hostels/{id}/rules', [\App\Http\Controllers\HostelRuleController::class, 'index']);

        // Hostel Attendance routes
        Route::get('/hostels/attendance', [\App\Http\Controllers\HostelAttendanceController::class, 'history']);
        Route::post('/hostels/attendance/check', [\App\Http\Controllers\HostelAttendanceController::class, 'check']);

        // Hostel Leaves routes
        Route::get('/hostels/leaves', [\App\Http\Controllers\HostelLeaveController::class, 'index']);
        Route::post('/hostels/leaves', [\App\Http\Controllers\HostelLeaveController::class, 'store']);

        // Hostel Visitors routes
        Route::get('/hostels/visitors', [\App\Http\Controllers\HostelVisitorController::class, 'index']);
        Route::post('/hostels/visitors', [\App\Http\Controllers\HostelVisitorController::class, 'store']);

        // Roommates matching routes
        Route::get('/hostels/roommates/profile', [\App\Http\Controllers\HostelRoommateController::class, 'getProfile']);
        Route::post('/hostels/roommates/profile', [\App\Http\Controllers\HostelRoommateController::class, 'saveProfile']);
        Route::get('/hostels/roommates/matches', [\App\Http\Controllers\HostelRoommateController::class, 'getMatches']);

        // Hostel Complaints/Maintenance — also static, must precede /{id}
        Route::get('/hostels/complaints', [\App\Http\Controllers\HostelComplaintController::class, 'index']);
        Route::post('/hostels/complaints', [\App\Http\Controllers\HostelComplaintController::class, 'store']);
        Route::get('/hostels/complaints/{id}', [\App\Http\Controllers\HostelComplaintController::class, 'show']);

        // Dynamic hostel routes — placed after static routes
        Route::get('/hostels/{id}', [\App\Http\Controllers\HostelController::class, 'show']);
        Route::get('/hostels/{id}/rooms', [\App\Http\Controllers\HostelController::class, 'availableRooms']);
    });
    Route::post('/events', [\App\Http\Controllers\EventController::class, 'store']);
    Route::put('/events/{id}', [\App\Http\Controllers\EventController::class, 'update']);
    Route::delete('/events/{id}', [\App\Http\Controllers\EventController::class, 'destroy']);

    // Associations Management (Admin/Lecturer)
    Route::get('/associations/my/memberships', [\App\Http\Controllers\AssociationController::class, 'myAssociations']);
    Route::post('/associations', [\App\Http\Controllers\AssociationController::class, 'store']);
    Route::put('/associations/{id}', [\App\Http\Controllers\AssociationController::class, 'update']);
    Route::delete('/associations/{id}', [\App\Http\Controllers\AssociationController::class, 'destroy']);

    // Social Hub
    Route::get('/posts', [\App\Http\Controllers\SocialController::class, 'index']);
    Route::post('/posts', [\App\Http\Controllers\SocialController::class, 'store']);
    Route::put('/posts/{id}', [\App\Http\Controllers\SocialController::class, 'update']);
    Route::delete('/posts/{id}', [\App\Http\Controllers\SocialController::class, 'destroy']);
    Route::post('/posts/{id}/like', [\App\Http\Controllers\SocialController::class, 'like']);
    Route::post('/posts/{id}/comment', [\App\Http\Controllers\SocialController::class, 'comment']);
    Route::post('/posts/{id}/report', [\App\Http\Controllers\SocialController::class, 'report']);

    // Friendships & Followers
    Route::get('/friends', [\App\Http\Controllers\FriendController::class, 'listFriends']);
    Route::get('/friends/requests/pending', [\App\Http\Controllers\FriendController::class, 'listPendingRequests']);
    Route::post('/friends/request', [\App\Http\Controllers\FriendController::class, 'sendRequest']);
    Route::post('/friends/request/{id}/accept', [\App\Http\Controllers\FriendController::class, 'acceptRequest']);
    Route::post('/friends/request/{id}/reject', [\App\Http\Controllers\FriendController::class, 'rejectRequest']);
    Route::delete('/friends/{id}', [\App\Http\Controllers\FriendController::class, 'unfriend']);

    // Communication & Utilities
    Route::get('/chats/lookup-user', [\App\Http\Controllers\ChatController::class, 'lookupUser']);
    Route::get('/chats', [\App\Http\Controllers\ChatController::class, 'index']);
    Route::post('/chats', [\App\Http\Controllers\ChatController::class, 'startConversation']);
    Route::get('/chats/{id}/messages', [\App\Http\Controllers\ChatController::class, 'getMessages']);
    Route::post('/chats/{id}/messages', [\App\Http\Controllers\ChatController::class, 'sendMessage']);
    
    // Media messaging
    Route::get('/messages/{id}/media', [\App\Http\Controllers\ChatController::class, 'downloadMedia']);
    Route::delete('/messages/{id}/media', [\App\Http\Controllers\ChatController::class, 'deleteMedia']);
    
    // Digital Library (Consolidated)
    Route::get('/library', [\App\Http\Controllers\LibraryController::class, 'index']);
    Route::get('/library/{id}', [\App\Http\Controllers\LibraryController::class, 'show']);
    Route::post('/library', [\App\Http\Controllers\LibraryController::class, 'store']); // Lecturer/Admin
    Route::put('/library/{id}', [\App\Http\Controllers\LibraryController::class, 'update']); // Lecturer/Admin
    Route::patch('/library/{id}/status', [\App\Http\Controllers\LibraryController::class, 'toggleStatus']); // Lecturer/Admin
    Route::post('/library/{id}/approve', [\App\Http\Controllers\LibraryController::class, 'approve']); // Admin
    Route::delete('/library/{id}', [\App\Http\Controllers\LibraryController::class, 'destroy']); // Admin

    // School Information (Consolidated)
    Route::get('/school/info', [\App\Http\Controllers\SchoolInfoController::class, 'getSchoolInfo']);
    Route::put('/school/info', [\App\Http\Controllers\SchoolInfoController::class, 'updateSchoolInfo']); // Admin
    
    // App Developers / About Us Routes
    Route::get('/about-us', [\App\Http\Controllers\AppDeveloperController::class, 'index']);
    Route::post('/admin/about-us', [\App\Http\Controllers\AppDeveloperController::class, 'store']);
    Route::put('/admin/about-us/{id}', [\App\Http\Controllers\AppDeveloperController::class, 'update']);
    Route::delete('/admin/about-us/{id}', [\App\Http\Controllers\AppDeveloperController::class, 'destroy']);

    Route::get('/school/rules', [\App\Http\Controllers\SchoolInfoController::class, 'getRules']);
    Route::post('/school/rules', [\App\Http\Controllers\SchoolInfoController::class, 'storeRule']); // Admin
    Route::put('/school/rules/{id}', [\App\Http\Controllers\SchoolInfoController::class, 'updateRule']); // Admin
    Route::delete('/school/rules/{id}', [\App\Http\Controllers\SchoolInfoController::class, 'deleteRule']); // Admin
    Route::get('/school/staff', [\App\Http\Controllers\SchoolInfoController::class, 'getStaffDirectory']);
    Route::post('/school/staff', [\App\Http\Controllers\SchoolInfoController::class, 'storeStaff']); // Admin
    Route::put('/school/staff/{id}', [\App\Http\Controllers\SchoolInfoController::class, 'updateStaff']); // Admin
    Route::delete('/school/staff/{id}', [\App\Http\Controllers\SchoolInfoController::class, 'deleteStaff']); // Admin

    Route::get('/school/calendar', [\App\Http\Controllers\SchoolInfoController::class, 'getAcademicCalendar']);
    Route::post('/school/calendar', [\App\Http\Controllers\SchoolInfoController::class, 'storeCalendarEvent']); // Admin
    Route::put('/school/calendar/{id}', [\App\Http\Controllers\SchoolInfoController::class, 'updateCalendarEvent']); // Admin
    Route::delete('/school/calendar/{id}', [\App\Http\Controllers\SchoolInfoController::class, 'deleteCalendarEvent']); // Admin
    Route::get('/school/map', [\App\Http\Controllers\SchoolController::class, 'mapLocations']); // Campus map locations

    // Campus Map
    Route::get('/campus/locations', [\App\Http\Controllers\CampusController::class, 'index']);
    Route::get('/campus/emergency', [\App\Http\Controllers\CampusController::class, 'emergencyPoints']);
    Route::post('/campus/locations', [\App\Http\Controllers\CampusController::class, 'store']); // Admin
    Route::put('/campus/locations/{id}', [\App\Http\Controllers\CampusController::class, 'update']); // Admin
    Route::delete('/campus/locations/{id}', [\App\Http\Controllers\CampusController::class, 'destroy']); // Admin

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

    // Assignments
    Route::get('/assignments', [\App\Http\Controllers\AssignmentController::class, 'index']);
    Route::get('/assignments/{id}', [\App\Http\Controllers\AssignmentController::class, 'show']);
    Route::post('/assignments', [\App\Http\Controllers\AssignmentController::class, 'store']); // Lecturer
    Route::post('/assignments/{id}/submit', [\App\Http\Controllers\AssignmentController::class, 'submit']); // Student
    Route::get('/submissions/{id}', [\App\Http\Controllers\AssignmentController::class, 'getSubmission']);
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
        // Dashboard
        Route::get('/dashboard', [\App\Http\Controllers\LecturerController::class, 'dashboard']);
        
        // Analytics
        Route::get('/analytics', [\App\Http\Controllers\LecturerController::class, 'analytics']);
        
        // Performance & Reports
        Route::get('/performance', [\App\Http\Controllers\LecturerController::class, 'getClassPerformance']);
        Route::get('/student-progress/{courseId}/{studentId}', [\App\Http\Controllers\LecturerController::class, 'getStudentProgress']);
        Route::get('/attendance-report/{courseId}', [\App\Http\Controllers\LecturerController::class, 'getAttendanceReport']);
        Route::get('/attendance/report', [\App\Http\Controllers\LecturerController::class, 'getAttendanceReport']); // Default report
        Route::get('/exam-stats', [\App\Http\Controllers\LecturerController::class, 'getExamStatistics']);
        
        // Courses
        Route::get('/courses/allocated', [\App\Http\Controllers\LecturerController::class, 'courses']);
        
        // Class Management
        Route::get('/classes/{id}', [\App\Http\Controllers\VirtualClassController::class, 'show']);
        
        // Exams (alias)
        Route::post('/exams', [\App\Http\Controllers\ExamController::class, 'store']);
        
        // Announcements
        Route::post('/announcements', [\App\Http\Controllers\AnnouncementController::class, 'store']);

        
        // Virtual Classes Management
        Route::get('/virtual-classes', [\App\Http\Controllers\VirtualClassController::class, 'index']);
        Route::post('/virtual-classes', [\App\Http\Controllers\VirtualClassController::class, 'store']);
        Route::get('/virtual-classes/{id}', [\App\Http\Controllers\VirtualClassController::class, 'show']);
        Route::get('/virtual-classes/{id}/participants', [\App\Http\Controllers\VirtualClassController::class, 'getParticipants']);
        Route::post('/virtual-classes/{id}/start', [\App\Http\Controllers\VirtualClassController::class, 'startClass']);
        Route::post('/virtual-classes/{id}/end', [\App\Http\Controllers\VirtualClassController::class, 'endClass']);
        Route::post('/virtual-classes/{id}/toggle-chat-mute', [\App\Http\Controllers\VirtualClassController::class, 'toggleChatMute']);

        // Assignments Management
        Route::get('/assignments', [\App\Http\Controllers\AssignmentController::class, 'index']);
        Route::get('/assignments/{id}', [\App\Http\Controllers\AssignmentController::class, 'show']);
        Route::post('/assignments', [\App\Http\Controllers\AssignmentController::class, 'store']);
        Route::get('/assignments/{id}/submissions', [\App\Http\Controllers\AssignmentController::class, 'getSubmissions']);
        Route::post('/assignments/submissions/{id}/grade', [\App\Http\Controllers\AssignmentController::class, 'grade']);
    });

    // Reporting System
    Route::prefix('reports')->group(function () {
        Route::get('/academic/{studentId?}', [\App\Http\Controllers\ReportController::class, 'generateAcademicReport']);
        Route::get('/attendance/{studentId?}', [\App\Http\Controllers\ReportController::class, 'generateAttendanceReport']);
        Route::get('/system-usage', [\App\Http\Controllers\ReportController::class, 'generateSystemUsageReport']); // Admin only
    });

    // Admin Panel Logic
    Route::prefix('admin')->group(function () {
        // Academic Structure CRUD
        Route::get('/faculties', [\App\Http\Controllers\AdminAcademicController::class, 'getFaculties']);
        Route::post('/faculties', [\App\Http\Controllers\AdminAcademicController::class, 'storeFaculty']);
        Route::put('/faculties/{id}', [\App\Http\Controllers\AdminAcademicController::class, 'updateFaculty']);
        Route::delete('/faculties/{id}', [\App\Http\Controllers\AdminAcademicController::class, 'destroyFaculty']);

        Route::get('/departments', [\App\Http\Controllers\AdminAcademicController::class, 'getDepartments']);
        Route::post('/departments', [\App\Http\Controllers\AdminAcademicController::class, 'storeDepartment']);
        Route::put('/departments/{id}', [\App\Http\Controllers\AdminAcademicController::class, 'updateDepartment']);
        Route::delete('/departments/{id}', [\App\Http\Controllers\AdminAcademicController::class, 'destroyDepartment']);

        Route::get('/programmes', [\App\Http\Controllers\AdminAcademicController::class, 'getProgrammes']);
        Route::post('/programmes', [\App\Http\Controllers\AdminAcademicController::class, 'storeProgramme']);
        Route::put('/programmes/{id}', [\App\Http\Controllers\AdminAcademicController::class, 'updateProgramme']);
        Route::delete('/programmes/{id}', [\App\Http\Controllers\AdminAcademicController::class, 'destroyProgramme']);

        Route::get('/sessions', [\App\Http\Controllers\AdminAcademicController::class, 'getSessions']);
        Route::post('/sessions', [\App\Http\Controllers\AdminAcademicController::class, 'storeSession']);
        Route::put('/sessions/{id}', [\App\Http\Controllers\AdminAcademicController::class, 'updateSession']);
        Route::delete('/sessions/{id}', [\App\Http\Controllers\AdminAcademicController::class, 'destroySession']);

        Route::get('/offices', [\App\Http\Controllers\AdminAcademicController::class, 'getOffices']);
        Route::post('/offices', [\App\Http\Controllers\AdminAcademicController::class, 'storeOffice']);
        Route::put('/offices/{id}', [\App\Http\Controllers\AdminAcademicController::class, 'updateOffice']);
        Route::delete('/offices/{id}', [\App\Http\Controllers\AdminAcademicController::class, 'destroyOffice']);

        // Dashboard & Overview
        Route::get('/stats', [\App\Http\Controllers\AdminController::class, 'stats']);
        Route::get('/overview', [\App\Http\Controllers\AdminController::class, 'systemOverview']);
        Route::get('/dashboard', [\App\Http\Controllers\AdminController::class, 'stats']); // Alias for dashboard
        Route::get('/analytics', [\App\Http\Controllers\AdminController::class, 'analytics']);
        
        // User Management
        Route::get('/users', [\App\Http\Controllers\AdminController::class, 'users']);
        Route::post('/users', [\App\Http\Controllers\AdminController::class, 'createUser']);
        Route::put('/users/{id}', [\App\Http\Controllers\AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [\App\Http\Controllers\AdminController::class, 'deleteUser']);
        Route::patch('/users/{id}/status', [\App\Http\Controllers\AdminController::class, 'updateUserStatus']);
        
        // Course Registrations
        Route::get('/registrations/pending', [\App\Http\Controllers\AdminController::class, 'pendingRegistrations']);
        Route::patch('/registrations/{id}/approve', [\App\Http\Controllers\AdminController::class, 'approveRegistration']);
        
        // Content Moderation
        Route::prefix('moderation')->group(function () {
            Route::get('/reports', [\App\Http\Controllers\ModerationController::class, 'getReports']);
            Route::get('/stats', [\App\Http\Controllers\ModerationController::class, 'getStats']);
            Route::post('/reports/{id}/resolve', [\App\Http\Controllers\ModerationController::class, 'resolveReport']);
        });
        
        // Content Approval
        Route::prefix('content')->group(function () {
            Route::get('/pending', [\App\Http\Controllers\ModerationController::class, 'getPendingContent']);
            Route::post('/{id}/approve', [\App\Http\Controllers\ModerationController::class, 'approveContent']);
            Route::post('/{id}/reject', [\App\Http\Controllers\ModerationController::class, 'rejectContent']);
            Route::delete('/{id}', [\App\Http\Controllers\ModerationController::class, 'deleteContent']);
            
            // Bulk Actions
            Route::post('/bulk-approve', [\App\Http\Controllers\ModerationController::class, 'bulkApprove']);
            Route::post('/bulk-reject', [\App\Http\Controllers\ModerationController::class, 'bulkReject']);
            Route::post('/bulk-delete', [\App\Http\Controllers\ModerationController::class, 'bulkDelete']);
        });

        // Admin Tutorials
        Route::prefix('tutorials')->group(function () {
            Route::get('/', [\App\Http\Controllers\TutorialController::class, 'adminIndex']);
            Route::put('/{id}', [\App\Http\Controllers\TutorialController::class, 'updateAsAdmin']);
            Route::delete('/{id}', [\App\Http\Controllers\TutorialController::class, 'destroyAsAdmin']);
            Route::post('/{id}/ban', [\App\Http\Controllers\TutorialController::class, 'ban']);
        });
        
        // System Monitoring
        Route::prefix('system')->group(function () {
            Route::get('/health', [\App\Http\Controllers\AdminController::class, 'systemHealth']);
            Route::get('/logs', [\App\Http\Controllers\AdminController::class, 'activityLogs']);
            Route::get('/storage', [\App\Http\Controllers\AdminController::class, 'storageStats']);
            Route::get('/settings', [\App\Http\Controllers\AdminController::class, 'getSystemSettings']);
            Route::post('/settings/toggle', [\App\Http\Controllers\AdminController::class, 'updateSystemToggle']);
            Route::post('/settings/session', [\App\Http\Controllers\AdminController::class, 'setActiveSession']);
            Route::post('/settings/reset', [\App\Http\Controllers\AdminController::class, 'resetSystemSettings']);
        });
        
        // Analytics Export
        Route::get('/analytics/export', [\App\Http\Controllers\AdminController::class, 'exportAnalytics']);
        
        // Audit Logs
        Route::prefix('audit-logs')->group(function () {
            Route::get('/', [\App\Http\Controllers\AuditLogController::class, 'index']);
            Route::get('/stats', [\App\Http\Controllers\AuditLogController::class, 'stats']);
            Route::get('/export', [\App\Http\Controllers\AuditLogController::class, 'export']);
            Route::get('/{id}', [\App\Http\Controllers\AuditLogController::class, 'show']);
        });
        
        // Event Approvals (Admin)
        Route::post('/events/{id}/approve', function ($id) {
            $event = \App\Models\Event::findOrFail($id);
            $event->update(['status' => 'approved']);
            return response()->json(['success' => true, 'message' => 'Event approved successfully.']);
        });
        Route::post('/events/{id}/reject', function ($id) {
            $event = \App\Models\Event::findOrFail($id);
            $event->update(['status' => 'rejected']);
            return response()->json(['success' => true, 'message' => 'Event rejected successfully.']);
        });

        // System Alerts

        Route::prefix('alerts')->group(function () {
            Route::get('/', [\App\Http\Controllers\SystemAlertController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\SystemAlertController::class, 'store']);
            Route::get('/unresolved', [\App\Http\Controllers\SystemAlertController::class, 'unresolved']);
            Route::get('/unresolved-count', [\App\Http\Controllers\SystemAlertController::class, 'unresolvedCount']);
            Route::post('/{id}/resolve', [\App\Http\Controllers\SystemAlertController::class, 'resolve']);
            Route::delete('/{id}', [\App\Http\Controllers\SystemAlertController::class, 'destroy']);
        });
        
        // Roles & Permissions
        Route::prefix('roles')->group(function () {
            Route::get('/', [\App\Http\Controllers\RoleController::class, 'index']);
            Route::post('/', [\App\Http\Controllers\RoleController::class, 'store']);
            Route::get('/{id}', [\App\Http\Controllers\RoleController::class, 'show']);
            Route::put('/{id}', [\App\Http\Controllers\RoleController::class, 'update']);
            Route::delete('/{id}', [\App\Http\Controllers\RoleController::class, 'destroy']);
            Route::post('/{id}/assign', [\App\Http\Controllers\RoleController::class, 'assignToUser']);
            Route::post('/{id}/remove', [\App\Http\Controllers\RoleController::class, 'removeFromUser']);
            Route::get('/{id}/users', [\App\Http\Controllers\RoleController::class, 'users']);
        });
        
        Route::get('/permissions', [\App\Http\Controllers\RoleController::class, 'permissions']);

        // Admin Hostel Management
        Route::prefix('hostels')->group(function () {
            Route::get('/', [\App\Http\Controllers\AdminHostelController::class, 'index']);
            Route::get('/stats', [\App\Http\Controllers\AdminHostelController::class, 'stats']);
            Route::post('/', [\App\Http\Controllers\AdminHostelController::class, 'storeHostel']);
            Route::put('/{id}', [\App\Http\Controllers\AdminHostelController::class, 'updateHostel']);
            Route::delete('/{id}', [\App\Http\Controllers\AdminHostelController::class, 'destroyHostel']);

            // Admin Bookings
            Route::get('/bookings', [\App\Http\Controllers\AdminHostelController::class, 'bookings']);
            Route::post('/bookings/{id}/approve', [\App\Http\Controllers\AdminHostelController::class, 'approveBooking']);
            Route::post('/bookings/{id}/reject', [\App\Http\Controllers\AdminHostelController::class, 'rejectBooking']);
            Route::post('/bookings/{id}/evict', [\App\Http\Controllers\AdminHostelController::class, 'evictStudent']);

            // Room Management
            Route::get('/{hostelId}/rooms', [\App\Http\Controllers\AdminHostelController::class, 'roomsByHostel']);
            Route::post('/{hostelId}/rooms', [\App\Http\Controllers\AdminHostelController::class, 'storeRoom']);
            Route::put('/rooms/{id}', [\App\Http\Controllers\AdminHostelController::class, 'updateRoom']);

            // Admin Rules Management
            Route::get('/{hostelId}/rules', [\App\Http\Controllers\HostelRuleController::class, 'index']);
            Route::post('/{hostelId}/rules', [\App\Http\Controllers\HostelRuleController::class, 'store']);
            Route::put('/rules/{id}', [\App\Http\Controllers\HostelRuleController::class, 'update']);
            Route::delete('/rules/{id}', [\App\Http\Controllers\HostelRuleController::class, 'destroy']);

            // Admin Attendance Logs
            Route::get('/attendance/logs', [\App\Http\Controllers\HostelAttendanceController::class, 'index']);

            // Admin Leaves Management
            Route::get('/leaves/requests', [\App\Http\Controllers\HostelLeaveController::class, 'adminIndex']);
            Route::patch('/leaves/{id}/status', [\App\Http\Controllers\HostelLeaveController::class, 'updateStatus']);

            // Admin Visitors Logs
            Route::get('/visitors/logs', [\App\Http\Controllers\HostelVisitorController::class, 'adminIndex']);
            Route::patch('/visitors/{id}/check-in', [\App\Http\Controllers\HostelVisitorController::class, 'checkIn']);
            Route::patch('/visitors/{id}/check-out', [\App\Http\Controllers\HostelVisitorController::class, 'checkOut']);

            // Admin Complaints management
            Route::get('/complaints', [\App\Http\Controllers\AdminHostelController::class, 'allComplaints']);
            Route::patch('/complaints/{id}', [\App\Http\Controllers\AdminHostelController::class, 'updateComplaintStatus']);
        });

        // Admin Finance / Payments
        Route::prefix('finance')->group(function () {
            Route::get('/payments', [\App\Http\Controllers\AdminPaymentController::class, 'index']);
            Route::post('/payments/{reference}/verify', [\App\Http\Controllers\AdminPaymentController::class, 'verifyPayment']);
        });
    });

    // AI Study Assistant
    Route::prefix('student/ai-assistant')->group(function () {
        Route::post('/chat', [\App\Http\Controllers\AIController::class, 'chat']);
        Route::get('/topics', [\App\Http\Controllers\AIController::class, 'topics']);
    });
});

// Public Payment Webhook (outside auth middleware)
Route::post('/payments/webhook', [\App\Http\Controllers\PaymentController::class, 'webhook']);

// Public Library Download (Protected by is_approved/is_public check in controller)
Route::get('/library/{id}/download', [\App\Http\Controllers\LibraryController::class, 'download']);
