Product Requirements Document (PRD)
Project Name: KIU Explorer – School Digital App
Prepared By: Umar Alhaji Husseini
Date: January 2026
1. Project Overview
1.1 Purpose:
KIU Explorer is a digital school application designed for Kashim Ibrahim University to centralize academic resources, virtual learning, student engagement, and administrative management. The app aims to:
•	Improve student learning through tutorials, AI assistance, and E-Classrooms.
•	Facilitate school-wide communication and announcements.
•	Enable student social engagement safely within the school environment.
•	Provide administrators and lecturers with control, analytics, and oversight.
1.2 Scope:
The app covers multiple modules:
•	Student, Lecturer, Association Executive, and Administrator dashboards.
•	Tutorials (video, audio, PDFs) and digital library.
•	AI-assisted learning.
•	E-Classroom (live and recorded sessions).
•	Practice E-Exams (timed CBT with auto-submit).
•	Social Hub (media sharing and engagement).
•	Events and Associations management.
•	Campus map and utilities.
•	Notifications and reminders.
1.3 Goals:
•	Provide a unified platform for learning and school activities.
•	Increase student engagement and participation.
•	Ensure safe and moderated social interactions.
•	Streamline administrative oversight of classes, exams, and events.
2. Stakeholders
Role	Description	Responsibilities
Students	Primary users	Access to tutorials, AI assistant, E-Classroom, social hub, exams, events, and resources.
Lecturers	Educators	Upload tutorials, manage E-Classroom, conduct E-Exams, monitor student performance, and oversee Social Hub posts.
Association Executives	Club & student leadership	Manage associations, organize events, post content in Social Hub.
Administrators	School management	User management, content approval, E-Exam & E-Classroom control, analytics, social hub moderation.
3. Features & Requirements
3.1 Student Features
Functional Requirements:
•	View school background, rules, staff directory, and academic calendar.
•	Access and download tutorials (video, audio, PDF).
•	Use AI assistant for homework help, topic explanations, note summarization.
•	Take practice quizzes and E-Exams (timed, auto-submit).
•	Join live E-Classroom sessions, view recorded classes, chat, raise hand, download materials.
•	Participate in social hub: post media, like/comment, follow classmates, report content.
•	Register for events, join associations, and participate in polls.
•	Access campus map, emergency points, and notifications.
•	Manage profile, view academic progress, attendance, and payments.
Non-Functional Requirements:
•	App must load tutorials and videos within 5 seconds.
•	AI assistant response should be under 10 seconds.
•	E-Classroom video latency < 2 seconds for live classes.
•	Data storage secure and encrypted.
3.2 Lecturer Features
Functional Requirements:
•	Upload tutorials and course materials.
•	Create assignments, quizzes, and E-Exams.
•	Manage live virtual classes (E-Classroom): start, record, share screen, control chat/microphones.
•	Track student attendance and participation.
•	Moderate Social Hub posts (academic relevance).
•	Access analytics: class performance, exam results.
Non-Functional Requirements:
•	Lecturer dashboards responsive across devices.
•	Secure login with role-based access.
•	Video upload size limit with automatic compression.
3.3 Association Executive Features
Functional Requirements:
•	Create and manage association profiles.
•	Approve/reject members and manage executives.
•	Organize events, schedule meetings, post announcements.
•	Upload media to Social Hub, moderate association-specific content.
•	Conduct polls and track participation.
•	Manage association finances (optional).
3.4 Administrator Features
Functional Requirements:
•	Manage all users, roles, and access permissions.
•	Approve tutorials and learning resources.
•	Monitor E-Classroom and E-Exam systems.
•	Moderate Social Hub content and enforce posting rules.
•	Post announcements, emergency alerts, and manage events.
•	Generate reports: analytics, attendance, exam performance, social activity.
•	Backup and recover system data securely.
Non-Functional Requirements:
•	High system availability (99.9% uptime).
•	Secure storage of sensitive student and exam data.
•	Scalable to handle thousands of users concurrently.
4. Use Cases (High-Level)
Actor	Use Case
Student	Join E-Classroom, take E-Exam, upload social post, download tutorial, view notifications.
Lecturer	Start live class, upload tutorials, mark attendance, create exam, approve student social posts.
Association Executive	Post announcements, organize event, upload association videos/photos.
Admin	Approve tutorial, manage user accounts, monitor E-Classroom, delete inappropriate content, generate reports.
5. System Architecture
•	Frontend: Flutter or React Native (iOS & Android)
•	Backend: Laravel (PHP) or Node.js REST API
•	Database: MySQL or PostgreSQL
•	Real-Time: WebSocket / Pusher / Firebase for chat & notifications
•	E-Classroom Video: Jitsi / WebRTC / Zoom SDK
•	File Storage: AWS S3 / Firebase Storage
•	AI: OpenAI API / Hugging Face API
High-Level Flow:
Mobile App -> Backend API -> Database
            -> Real-Time Services (chat, live class)
            -> AI Assistant API
            -> Cloud Storage (tutorials, recordings, media)
6. Technical & Non-Functional Requirements
•	Security: Role-based access, password hashing, HTTPS encryption.
•	Performance: App loads <3s, E-Classroom latency <2s.
•	Scalability: Support 10k+ concurrent users.
•	Usability: User-friendly dashboards per role.
•	Backup & Recovery: Daily automatic database backups.
•	Compatibility: Android 10+, iOS 13+.
7. Roadmap / Development Phases
Phase	Features
Phase 1	Authentication, student dashboard, tutorials
Phase 2	E-Classroom (live + recorded), attendance
Phase 3	E-Exams, quizzes, results analytics
Phase 4	Social Hub (student + association)
Phase 5	Lecturer dashboards, content upload, moderation
Phase 6	Admin panel, full control & analytics
Phase 7	Testing, deployment, and documentation
 
KIU EXPLORER
SCHOOL APP FEATURE BREAKDOWN (BY ROLE)
Including E-Classroom
1. STUDENT APP FEATURES
1.1 School Information
•	View school background, history, vision, and mission
•	View school rules and code of conduct
•	View staff directory
•	View academic calendar
1.2 Academic & Learning
•	Access video, audio, and text tutorials
•	Download lecture notes and course PDFs
•	Access digital library and past questions
•	Use AI learning assistant for:
o	Homework help
o	Topic explanations
o	Note summarization
o	Exam preparation
•	Take practice quizzes
•	Practice E-Exams (CBT)
•	View exam timetable and instructions
•	Timed exams with auto-submit
•	View practice exam results and performance analysis
1.3 E-Classroom (Virtual Classroom)
•	Join scheduled live classes
•	View class timetable
•	Live video/audio classes
•	Live text chat during class
•	Raise hand / ask questions
•	View shared screen or whiteboard
•	Download class materials shared by lecturer
•	Attendance marking during live class
•	Watch recorded classes (after session)
•	Receive class reminders and notifications
1.4 Communication & Notifications
•	Chat with lecturers
•	Participate in class group chats
•	Receive announcements and circulars
•	Receive push notifications for:
o	Classes
o	Exams
o	Assignments
o	Events
o	Emergencies
1.5 Student Life & Engagement
•	View school events and activities
•	Register for events
•	Join student associations and clubs
•	View association announcements
•	Participate in association polls and voting
•	View association events and meeting schedules
1.6 Student Social Hub (Media & Community)
•	Upload school-related videos, photos, and audio
•	Add captions, hashtags, and categories
•	Select visibility (school-wide, class, association)
•	View social feed (timeline)
•	Like, comment, share, and save posts
•	Upload event highlights
•	View trending school posts
•	Follow classmates (optional)
•	Report inappropriate content
•	Manage own posts (edit/delete)
•	View engagement statistics
1.7 Resources & Utilities
•	Access digital library
•	Download resources for offline use
•	View academic calendar
•	Access school map and directions
•	View emergency contact points
1.8 Profile & Dashboard
•	Secure login/logout
•	Student profile management
•	View enrolled courses
•	View attendance records (class + school)
•	View academic progress dashboard
•	View payment history (if enabled)
2. LECTURER / TEACHER APP FEATURES
2.1 Academic Management
•	Upload tutorials (video, audio, text)
•	Upload lecture notes and course PDFs
•	Create quizzes and assignments
•	Create, schedule, and manage E-Exams
•	Set exam duration and access rules
•	Upload objective and theory questions
•	Auto-mark objective questions
•	Manually mark theory answers
•	Publish exam results
•	View student performance analytics
2.2 E-Classroom Management
•	Create and schedule virtual classes
•	Start live video/audio classes
•	Share screen and whiteboard
•	Upload and share class materials in real time
•	Control student microphones and chat
•	Mark attendance automatically or manually
•	Record classes for replay
•	End or reschedule classes
2.3 Communication
•	Chat with students
•	Manage class group chats
•	Send academic announcements
•	Send class, exam, and assignment reminders
2.4 Attendance & Monitoring
•	View class attendance records
•	Export attendance data
•	Monitor student participation
2.5 Social Hub Oversight
•	View student social posts
•	Comment for academic guidance
•	Report inappropriate content
•	Approve academic-related videos (if permitted)
2.6 Profile & Dashboard
•	Lecturer login/logout
•	Manage personal profile
•	View assigned courses and classes
•	Track teaching activities
3. ASSOCIATION EXECUTIVE FEATURES
3.1 Association Management
•	Manage association profile (name, logo, description)
•	Approve or reject membership requests
•	Manage association executives
•	Upload association documents
•	Create association events and activities
•	Schedule meetings (physical or virtual)
3.2 Communication & Engagement
•	Post association announcements
•	Internal association chat
•	Create polls and voting
•	Track member participation
3.3 Social Hub (Association Content)
•	Upload association activity videos and photos
•	Post event highlights
•	Pin association posts
•	Moderate association-specific content
3.4 Financial Management (Optional)
•	Track membership dues
•	Record contributions
•	Generate financial summaries
4. ADMINISTRATOR (SCHOOL MANAGEMENT) FEATURES
4.1 User & System Management
•	Full system access
•	Create, edit, and delete users
•	Assign roles (student, lecturer, executive)
•	Activate or deactivate accounts
•	Reset user passwords
4.2 Academic & Content Control
•	Approve tutorials and learning resources
•	Manage E-Exams globally
•	Approve exam schedules
•	Control AI usage limits
•	Manage academic calendar
4.3 E-Classroom Control
•	Enable or disable E-Classroom system
•	Monitor live and recorded classes
•	Manage storage for recorded sessions
•	Enforce virtual class policies
4.4 Social Hub Control
•	Approve or reject student uploads
•	Delete inappropriate posts
•	Handle reported content
•	Suspend or ban users
•	Control posting rules and limits
•	Enable or disable Social Hub
4.5 Communication & Events Control
•	Post school-wide announcements
•	Send emergency alerts
•	Moderate chats and content
•	Manage school-wide events
4.6 Reports, Analytics & Security
•	View system analytics
•	Generate academic, attendance, class, and usage reports
•	Export results and records
•	View audit logs
•	Manage data backup and recovery
•	Enforce privacy and security policies
5. WHY ADDING E-CLASSROOM STRENGTHENS THE APP
•	Supports remote and hybrid learning
•	Improves teacher–student interaction
•	Provides recorded lessons for revision
•	Enhances digital education readiness
•	Makes the app competitive with modern LMS platforms
6. RECOMMENDED NEXT STEP
Best development order now:
1.	User authentication & role-based dashboard
2.	Student module
3.	E-Classroom (basic live + recording)
4.	E-Exam module
5.	Social Hub
6.	Admin panel

user profile info

1. Core Identification Details

These uniquely identify the user.

User ID (auto-generated)

Registration / Matric Number

Surname

First Name

Other Names

Passport Photograph

Gender

Date of Birth

Nationality

State of Origin

Local Government Area (LGA)

2. Academic Information

These define the user’s academic profile.

Faculty

Department

Programme / Course of Study

Level (e.g., 100, 200, 300, 400)

Mode of Study (Full-time / Part-time)

Session / Academic Year

Admission Year

Entry Mode (UTME / DE / Transfer)

Student Status (Active / Suspended / Graduated)

3. Contact Information

For communication and notifications.

Email Address

Phone Number

Alternative Phone Number

Residential Address

City

State of Residence

4. Authentication & System Access

For login and security.

Username (optional if email is used)

Password

Confirm Password

Role (Student / Staff / Admin)

Account Status (Active / Blocked / Pending Verification)

Email Verification Status

Last Login Date

5. Parent / Guardian Information

Very important for school systems.

Parent/Guardian Full Name

Relationship

Parent/Guardian Phone Number

Parent/Guardian Email

Parent/Guardian Address

7. Documents Upload (Optional but Professional)

For verification purposes.

Admission Letter

Birth Certificate / Declaration of Age

O’Level Result

ID Card Upload

Other Supporting Documents

8. System Metadata (Backend Only)

Not filled by users directly.

Created At

Updated At

Created By (Admin ID)

IP Address

Device Info