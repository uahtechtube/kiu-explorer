-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 08, 2026 at 08:49 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kiu_explorer`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_calendar`
--

CREATE TABLE `academic_calendar` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('exam','registration','break','resumption','event','deadline','other') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `academic_session` varchar(255) NOT NULL,
  `semester` varchar(255) DEFAULT NULL,
  `color` varchar(255) NOT NULL DEFAULT '#3B82F6',
  `is_public` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `academic_events`
--

CREATE TABLE `academic_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `type` enum('Holiday','Exam','Academic','Registration') NOT NULL DEFAULT 'Academic',
  `description` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `academic_sessions`
--

CREATE TABLE `academic_sessions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_sessions`
--

INSERT INTO `academic_sessions` (`id`, `name`, `is_current`, `start_date`, `end_date`, `created_at`, `updated_at`) VALUES
(1, '2025/2026', 1, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(2, '2026/2027', 0, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `type` enum('general','academic','emergency','event','exam','administrative') NOT NULL,
  `target_audience` enum('all','students','lecturers','staff','level_100','level_200','level_300','level_400','level_500') NOT NULL,
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `published_by` bigint(20) UNSIGNED NOT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `attachment_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `send_notification` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `type`, `target_audience`, `priority`, `published_by`, `published_at`, `expires_at`, `attachment_url`, `is_active`, `send_notification`, `created_at`, `updated_at`) VALUES
(1, 'Greeting', 'Hello guys', 'academic', 'students', 'medium', 2, '2026-05-02 09:07:32', NULL, NULL, 1, 1, '2026-05-02 09:07:32', '2026-05-02 09:07:32'),
(2, 'Hello', 'Hello guys are you ok', 'academic', 'students', 'medium', 2, '2026-05-02 10:53:44', NULL, NULL, 1, 1, '2026-05-02 10:53:44', '2026-05-02 10:53:44');

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `lecturer_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `instructions` text DEFAULT NULL,
  `attachment_path` varchar(255) DEFAULT NULL,
  `due_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `max_score` int(11) NOT NULL DEFAULT 100,
  `allow_late_submission` tinyint(1) NOT NULL DEFAULT 0,
  `late_penalty_percent` int(11) NOT NULL DEFAULT 0,
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `assignment_submissions`
--

CREATE TABLE `assignment_submissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `assignment_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `submission_text` text DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_late` tinyint(1) NOT NULL DEFAULT 0,
  `score` int(11) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `graded_by` bigint(20) UNSIGNED DEFAULT NULL,
  `graded_at` timestamp NULL DEFAULT NULL,
  `status` enum('submitted','graded','returned') NOT NULL DEFAULT 'submitted',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `associations`
--

CREATE TABLE `associations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'club',
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `associations`
--

INSERT INTO `associations` (`id`, `name`, `description`, `logo`, `banner`, `type`, `status`, `created_at`, `updated_at`) VALUES
(1, 'National Association of Computer Science Students (NACOSS)', 'The umbrella body for all computing students.', NULL, NULL, 'academic', 'active', '2026-02-08 09:51:38', '2026-02-08 09:51:38'),
(2, 'National Association of Computer Science Students (NACOSS)', 'The umbrella body for all computing students.', NULL, NULL, 'academic', 'active', '2026-02-08 09:57:38', '2026-02-08 09:57:38');

-- --------------------------------------------------------

--
-- Table structure for table `association_members`
--

CREATE TABLE `association_members` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `association_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'member',
  `joined_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendances`
--

CREATE TABLE `attendances` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `virtual_class_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `joined_at` datetime NOT NULL,
  `left_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_hand_raised` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `action` varchar(255) NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(255) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `campus_locations`
--

CREATE TABLE `campus_locations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('building','facility','emergency_point','office','library','cafeteria','hostel','sports','other') NOT NULL,
  `description` text DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `operating_hours` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `floor_number` int(11) DEFAULT NULL,
  `building_code` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'private',
  `last_message_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `group_id` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `conversation_participants`
--

CREATE TABLE `conversation_participants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `conversation_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `last_read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `courses`
--

CREATE TABLE `courses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `department_id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `unit` int(11) NOT NULL,
  `level` varchar(255) NOT NULL,
  `semester` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `is_elective` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courses`
--

INSERT INTO `courses` (`id`, `department_id`, `code`, `title`, `unit`, `level`, `semester`, `description`, `is_elective`, `created_at`, `updated_at`) VALUES
(1, 1, 'CSC 301', 'Database Management Systems', 3, '300', 'First', NULL, 0, '2026-01-16 19:34:26', '2026-01-16 19:34:26'),
(2, 1, 'CSC 305', 'Operating Systems I', 3, '300', 'First', NULL, 0, '2026-01-16 19:34:26', '2026-01-16 19:34:26');

-- --------------------------------------------------------

--
-- Table structure for table `course_allocations`
--

CREATE TABLE `course_allocations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `academic_session_id` bigint(20) UNSIGNED NOT NULL,
  `is_coordinator` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `course_registrations`
--

CREATE TABLE `course_registrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `academic_session_id` bigint(20) UNSIGNED NOT NULL,
  `ca_score` decimal(5,2) DEFAULT NULL,
  `exam_score` decimal(5,2) DEFAULT NULL,
  `total_score` decimal(5,2) DEFAULT NULL,
  `grade` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'registered',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `course_registrations`
--

INSERT INTO `course_registrations` (`id`, `user_id`, `course_id`, `academic_session_id`, `ca_score`, `exam_score`, `total_score`, `grade`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 1, 1, NULL, NULL, NULL, NULL, 'registered', '2026-02-08 11:45:19', '2026-02-08 11:45:19'),
(2, 3, 2, 1, NULL, NULL, NULL, NULL, 'registered', '2026-02-08 11:45:30', '2026-02-08 11:45:30');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `faculty_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `code`, `description`, `created_at`, `updated_at`) VALUES
(1, 1, 'Medicine and Surgery', NULL, NULL, '2026-02-08 09:57:33', '2026-02-08 09:57:33'),
(2, 1, 'Nursing Science', NULL, NULL, '2026-02-08 09:57:33', '2026-02-08 09:57:33'),
(3, 1, 'Physiotherapy', NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(4, 1, 'Radiography', NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(5, 1, 'Medical Laboratory Science', NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(6, 1, 'Health Information Management', NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(7, 2, 'Agriculture', NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(8, 3, 'Animal and Environmental Biology', NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(9, 3, 'Biotechnology', NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(10, 3, 'Plant Science and Biotechnology', NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(11, 3, 'Computer Science', NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(12, 3, 'Mathematics', NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(13, 3, 'Statistics', NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(14, 3, 'Chemistry', NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(15, 3, 'Physics', NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(16, 3, 'Biochemistry', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(17, 4, 'Accounting', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(18, 4, 'Business Administration', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(19, 4, 'Economics', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(20, 4, 'Criminology and Security Studies', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(21, 4, 'Geography', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(22, 4, 'Mass Communication', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(23, 4, 'Public Administration', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(24, 4, 'Political Science', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(25, 4, 'Peace Studies and Conflict Resolution', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(26, 4, 'Sociology', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(27, 5, 'Education English', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(28, 5, 'Education Islamic Studies', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(29, 5, 'Education Economics', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(30, 5, 'Education Mathematics', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(31, 5, 'Education Physics', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(32, 5, 'Education Computer Science', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(33, 5, 'Education Chemistry', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(34, 5, 'Education Biology', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(35, 5, 'English Language', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(36, 5, 'Literature in English', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(37, 5, 'Islamic Studies', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `association_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `venue` varchar(255) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'upcoming',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_registrations`
--

CREATE TABLE `event_registrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `event_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `registered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exams`
--

CREATE TABLE `exams` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED DEFAULT NULL,
  `course_code` varchar(255) DEFAULT NULL,
  `academic_session_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `instructions` text DEFAULT NULL,
  `type` enum('objective','theory','hybrid') NOT NULL DEFAULT 'objective',
  `duration` int(11) NOT NULL COMMENT 'Duration in minutes',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `total_marks` int(11) NOT NULL DEFAULT 100,
  `passing_marks` int(11) NOT NULL DEFAULT 40,
  `is_published` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `uploaded_by` bigint(20) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exams`
--

INSERT INTO `exams` (`id`, `course_id`, `course_code`, `academic_session_id`, `title`, `instructions`, `type`, `duration`, `start_time`, `end_time`, `total_marks`, `passing_marks`, `is_published`, `created_at`, `updated_at`, `uploaded_by`) VALUES
(1, NULL, 'EDU 200', 1, 'Teaching Practice', NULL, 'objective', 2, '2026-05-02 00:00:00', '2026-05-02 00:02:00', 2, 1, 0, '2026-05-02 19:36:03', '2026-05-02 19:36:03', NULL),
(2, NULL, 'Edu 200', 1, 'Teaching Practice', NULL, 'objective', 5, '2026-05-03 00:00:00', '2026-05-03 00:05:00', 50, 25, 1, '2026-05-02 20:08:11', '2026-05-02 20:08:11', NULL),
(3, NULL, 'Edu 401', 1, 'Teaching Practice', NULL, 'objective', 5, '2026-05-02 21:30:00', '2026-05-02 21:35:00', 8, 4, 1, '2026-05-02 20:29:06', '2026-05-02 20:29:06', NULL),
(4, NULL, 'CSC 101', 1, 'Introduction to Computer', NULL, 'objective', 5, '2026-05-02 21:50:25', '2026-05-02 21:55:25', 100, 50, 1, '2026-05-02 20:51:02', '2026-05-02 20:51:02', NULL),
(5, NULL, 'CSC 404', 1, 'Teeheh', NULL, 'objective', 6, '2026-05-02 22:05:00', '2026-05-02 22:11:00', 2, 1, 1, '2026-05-02 21:04:11', '2026-05-02 21:04:34', 2),
(6, NULL, 'CSC 404', 1, 'Test', NULL, 'objective', 5, '2026-05-02 22:29:05', '2026-05-02 22:34:05', 2, 1, 1, '2026-05-02 21:29:33', '2026-05-02 21:29:33', 2);

-- --------------------------------------------------------

--
-- Table structure for table `exam_attempts`
--

CREATE TABLE `exam_attempts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `exam_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `started_at` datetime NOT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `status` enum('ongoing','submitted','marked') NOT NULL DEFAULT 'ongoing',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exam_attempts`
--

INSERT INTO `exam_attempts` (`id`, `exam_id`, `user_id`, `started_at`, `submitted_at`, `score`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 3, '2026-05-02 21:30:10', '2026-05-02 21:34:08', 8, 'submitted', '2026-05-02 20:30:10', '2026-05-02 20:34:08'),
(2, 4, 3, '2026-05-02 21:51:56', '2026-05-02 21:52:01', 100, 'submitted', '2026-05-02 20:51:56', '2026-05-02 20:52:01'),
(3, 5, 3, '2026-05-02 22:05:04', '2026-05-02 22:05:08', 2, 'submitted', '2026-05-02 21:05:04', '2026-05-02 21:05:08');

-- --------------------------------------------------------

--
-- Table structure for table `exam_responses`
--

CREATE TABLE `exam_responses` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `exam_attempt_id` bigint(20) UNSIGNED NOT NULL,
  `question_id` bigint(20) UNSIGNED NOT NULL,
  `selected_option_id` bigint(20) UNSIGNED DEFAULT NULL,
  `theory_answer` text DEFAULT NULL,
  `marks_obtained` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `exam_responses`
--

INSERT INTO `exam_responses` (`id`, `exam_attempt_id`, `question_id`, `selected_option_id`, `theory_answer`, `marks_obtained`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 8, NULL, 0, '2026-05-02 20:34:04', '2026-05-02 20:34:04'),
(2, 1, 3, 8, NULL, 8, '2026-05-02 20:34:08', '2026-05-02 20:34:08'),
(3, 2, 4, 11, NULL, 0, '2026-05-02 20:51:58', '2026-05-02 20:51:58'),
(4, 2, 4, 11, NULL, 100, '2026-05-02 20:52:01', '2026-05-02 20:52:01'),
(5, 3, 5, 15, NULL, 0, '2026-05-02 21:05:06', '2026-05-02 21:05:06'),
(6, 3, 5, 15, NULL, 2, '2026-05-02 21:05:08', '2026-05-02 21:05:08');

-- --------------------------------------------------------

--
-- Table structure for table `faculties`
--

CREATE TABLE `faculties` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faculties`
--

INSERT INTO `faculties` (`id`, `name`, `code`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Faculty of Basic Medical and Allied Health Science', NULL, NULL, '2026-02-08 09:57:33', '2026-02-08 09:57:33'),
(2, 'Faculty of Agriculture', NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(3, 'Faculty of Science', NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(4, 'Faculty of Social & Management Sciences', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(5, 'Faculty of Art and Education', NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `friendships`
--

CREATE TABLE `friendships` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `friend_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `friend_requests`
--

CREATE TABLE `friend_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `sender_id` bigint(20) UNSIGNED NOT NULL,
  `receiver_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `general_attendance`
--

CREATE TABLE `general_attendance` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `attendance_date` date NOT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `status` enum('present','absent','late','excused') NOT NULL DEFAULT 'present',
  `notes` text DEFAULT NULL,
  `marked_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `groups`
--

CREATE TABLE `groups` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('departmental','general','course') NOT NULL DEFAULT 'general',
  `creator_id` bigint(20) UNSIGNED NOT NULL,
  `is_public` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `group_members`
--

CREATE TABLE `group_members` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `group_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `role` enum('admin','member') NOT NULL DEFAULT 'member',
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hostels`
--

CREATE TABLE `hostels` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `campus_location_id` bigint(20) UNSIGNED NOT NULL,
  `gender_type` enum('male','female','mixed') NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hostel_beds`
--

CREATE TABLE `hostel_beds` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `hostel_room_id` bigint(20) UNSIGNED NOT NULL,
  `bed_number` varchar(255) NOT NULL,
  `is_occupied` tinyint(1) NOT NULL DEFAULT 0,
  `student_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hostel_bookings`
--

CREATE TABLE `hostel_bookings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `hostel_room_id` bigint(20) UNSIGNED NOT NULL,
  `academic_session` varchar(255) NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `payment_id` bigint(20) UNSIGNED DEFAULT NULL,
  `booked_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hostel_complaints`
--

CREATE TABLE `hostel_complaints` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `hostel_id` bigint(20) UNSIGNED NOT NULL,
  `hostel_room_id` bigint(20) UNSIGNED NOT NULL,
  `category` enum('plumbing','electrical','carpentry','cleaning','security','water_supply','other') DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('pending','assigned','in_progress','resolved','closed') DEFAULT 'pending',
  `admin_comment` text DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hostel_rooms`
--

CREATE TABLE `hostel_rooms` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `hostel_id` bigint(20) UNSIGNED NOT NULL,
  `room_number` varchar(255) NOT NULL,
  `capacity` int(11) NOT NULL,
  `available_slots` int(11) NOT NULL,
  `price_per_semester` decimal(10,2) NOT NULL,
  `status` enum('available','full','maintenance') NOT NULL DEFAULT 'available',
  `amenities` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lecturer_profiles`
--

CREATE TABLE `lecturer_profiles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `department_id` bigint(20) UNSIGNED DEFAULT NULL,
  `staff_id` varchar(255) DEFAULT NULL,
  `qualification` varchar(255) DEFAULT NULL,
  `rank` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `specialization` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lecturer_profiles`
--

INSERT INTO `lecturer_profiles` (`id`, `user_id`, `department_id`, `staff_id`, `qualification`, `rank`, `bio`, `specialization`, `created_at`, `updated_at`) VALUES
(1, 14, 1, NULL, NULL, NULL, NULL, NULL, '2026-04-21 20:51:04', '2026-04-21 20:51:04'),
(2, 15, 1, NULL, NULL, NULL, NULL, NULL, '2026-05-01 15:43:38', '2026-05-01 15:43:38');

-- --------------------------------------------------------

--
-- Table structure for table `library_resources`
--

CREATE TABLE `library_resources` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) DEFAULT NULL,
  `category` enum('textbook','journal','past_question','reference','research','other') NOT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(255) NOT NULL,
  `file_size` int(11) NOT NULL DEFAULT 0,
  `cover_image` varchar(255) DEFAULT NULL,
  `course_id` bigint(20) UNSIGNED DEFAULT NULL,
  `course_code` varchar(20) DEFAULT NULL,
  `uploaded_by` bigint(20) UNSIGNED NOT NULL,
  `downloads_count` int(11) NOT NULL DEFAULT 0,
  `is_public` tinyint(1) NOT NULL DEFAULT 1,
  `is_approved` tinyint(1) NOT NULL DEFAULT 0,
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `library_resources`
--

INSERT INTO `library_resources` (`id`, `title`, `author`, `category`, `description`, `file_path`, `file_type`, `file_size`, `cover_image`, `course_id`, `course_code`, `uploaded_by`, `downloads_count`, `is_public`, `is_approved`, `approved_by`, `approved_at`, `created_at`, `updated_at`) VALUES
(1, 'Mastering Laravel 11', 'Taylor Otwell', 'textbook', 'Modern web development with PHP.', 'library/sample.pdf', 'PDF', 1024000, NULL, NULL, NULL, 1, 0, 1, 1, 1, '2026-02-08 09:57:38', '2026-02-08 09:57:38', '2026-02-08 09:57:38'),
(2, 'Teaching Practice', NULL, 'reference', 'Teaching Practice', 'library/591bc0cc-988f-4e15-a8f0-f728210c0c55.pdf', 'pdf', 389282, NULL, NULL, 'EDU 200', 2, 2, 1, 1, NULL, NULL, '2026-05-02 19:21:03', '2026-05-02 21:37:50');

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `post_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `conversation_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `content` text NOT NULL,
  `media_url` varchar(255) DEFAULT NULL,
  `media_size` int(11) DEFAULT NULL,
  `media_mime_type` varchar(255) DEFAULT NULL,
  `media_duration` int(11) DEFAULT NULL,
  `thumbnail_url` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `type` enum('text','image','document','voice','video','file') DEFAULT 'text',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_01_03_000000_create_academic_structure_tables', 1),
(5, '2026_01_04_000000_create_student_profiles_table', 1),
(6, '2026_01_05_000000_create_academic_structure_tables', 1),
(7, '2026_01_06_120000_create_lecturer_profiles_table', 1),
(8, '2026_01_06_120500_create_courses_table', 1),
(9, '2026_01_06_121000_create_course_registrations_table', 1),
(10, '2026_01_06_121417_create_personal_access_tokens_table', 1),
(11, '2026_01_06_121500_create_course_allocations_table', 1),
(12, '2026_01_06_140000_create_tutorials_table', 1),
(13, '2026_01_10_000000_create_virtual_classes_table', 1),
(14, '2026_01_10_000001_create_attendances_table', 1),
(15, '2026_01_10_100000_add_recordings_to_virtual_classes', 1),
(16, '2026_01_10_110000_create_exams_table', 1),
(17, '2026_01_10_110100_create_questions_table', 1),
(18, '2026_01_10_110200_create_options_table', 1),
(19, '2026_01_10_110300_create_exam_attempts_table', 1),
(20, '2026_01_10_110400_create_exam_responses_table', 1),
(21, '2026_01_11_120000_create_associations_table', 1),
(22, '2026_01_11_120100_create_association_members_table', 1),
(23, '2026_01_11_120200_create_posts_table', 1),
(24, '2026_01_11_120300_create_comments_table', 1),
(25, '2026_01_11_120400_create_likes_table', 1),
(26, '2026_01_11_120500_create_events_table', 1),
(27, '2026_01_11_120600_create_event_registrations_table', 1),
(28, '2026_01_11_130000_create_conversations_table', 1),
(29, '2026_01_11_130100_create_conversation_participants_table', 1),
(30, '2026_01_11_130200_create_messages_table', 1),
(31, '2026_01_11_130300_create_notifications_table', 1),
(32, '2026_01_13_000000_ensure_virtual_classes_exists', 1),
(33, '2026_01_13_180000_create_friend_requests_table', 1),
(34, '2026_01_13_180100_create_friendships_table', 1),
(35, '2026_01_13_180200_create_groups_table', 1),
(36, '2026_01_13_180300_create_group_members_table', 1),
(37, '2026_01_13_180400_add_group_id_to_conversations_table', 1),
(38, '2026_01_13_190000_add_media_support_to_messages_table', 1),
(39, '2026_01_13_200000_create_school_info_table', 1),
(40, '2026_01_13_200100_create_school_rules_table', 1),
(41, '2026_01_13_200200_create_staff_directory_table', 1),
(42, '2026_01_13_200300_create_academic_calendar_table', 1),
(43, '2026_01_13_200400_create_parent_guardians_table', 1),
(44, '2026_01_13_200500_create_student_documents_table', 1),
(45, '2026_01_13_200600_create_announcements_table', 1),
(46, '2026_01_13_201000_create_library_resources_table', 1),
(47, '2026_01_13_201100_create_assignments_table', 1),
(48, '2026_01_13_201200_create_assignment_submissions_table', 1),
(49, '2026_01_13_201300_create_campus_locations_table', 1),
(50, '2026_01_13_201400_create_general_attendance_table', 1),
(51, '2026_01_13_202000_create_quizzes_table', 1),
(52, '2026_01_13_202100_create_quiz_attempts_table', 1),
(53, '2026_01_13_202200_create_polls_table', 1),
(54, '2026_01_13_202300_create_poll_options_table', 1),
(55, '2026_01_13_202400_create_poll_votes_table', 1),
(56, '2026_01_18_000000_add_settings_to_users_table', 2),
(57, '2026_01_18_000001_create_support_tickets_table', 2),
(58, '2026_01_18_000002_create_quiz_questions_table', 2),
(59, '2026_02_08_000000_create_reports_table', 2),
(60, '2026_02_08_120000_create_academic_events_table', 3),
(61, '2026_02_08_120100_create_audit_logs_table', 3),
(62, '2026_02_08_120200_create_system_alerts_table', 3),
(63, '2026_02_08_120300_create_permissions_and_roles_tables', 3),
(64, '2026_02_08_140000_add_virtual_class_features', 3),
(65, '2026_02_08_200000_create_payments_table', 4),
(66, '2026_02_23_000000_create_hostels_table', 5),
(67, '2026_02_23_000000_fix_database_schema', 6),
(68, '2026_02_23_000001_create_hostel_rooms_table', 6),
(69, '2026_02_23_000002_create_hostel_bookings_table', 6),
(70, '2026_02_23_000003_create_hostel_complaints_table', 7),
(71, '2026_02_24_000000_add_youtube_fields_to_tutorials', 8),
(72, '2026_04_21_214915_create_hostel_beds_table', 9),
(73, '2026_04_21_221753_alter_hostel_complaints_enums', 9),
(74, '2026_05_01_171500_add_course_code_and_status_to_tutorials_table', 10),
(75, '2026_05_02_100000_make_course_id_nullable_in_tutorials_table', 10),
(76, '2026_05_02_110000_add_course_code_to_library_resources_table', 11),
(77, '2026_05_02_120000_add_course_code_to_exams_table', 12),
(78, '2026_05_02_130000_add_uploaded_by_to_exams_table', 13);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `type` varchar(255) NOT NULL,
  `notifiable_type` varchar(255) NOT NULL,
  `notifiable_id` bigint(20) UNSIGNED NOT NULL,
  `data` text NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `options`
--

CREATE TABLE `options` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `question_id` bigint(20) UNSIGNED NOT NULL,
  `option_text` text NOT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `options`
--

INSERT INTO `options` (`id`, `question_id`, `option_text`, `is_correct`, `created_at`, `updated_at`) VALUES
(1, 1, 'Teaching Practice', 1, '2026-05-02 19:36:03', '2026-05-02 19:36:03'),
(2, 1, 'Teaching professional', 0, '2026-05-02 19:36:03', '2026-05-02 19:36:03'),
(3, 1, 'Teacher performance', 0, '2026-05-02 19:36:03', '2026-05-02 19:36:03'),
(4, 1, 'Teaching Practice', 0, '2026-05-02 19:36:03', '2026-05-02 19:36:03'),
(5, 2, 'Information technology', 1, '2026-05-02 20:08:11', '2026-05-02 20:08:11'),
(6, 2, 'Information that', 0, '2026-05-02 20:08:11', '2026-05-02 20:08:11'),
(7, 2, 'Informal team', 0, '2026-05-02 20:08:11', '2026-05-02 20:08:11'),
(8, 3, 'Computer science', 1, '2026-05-02 20:29:06', '2026-05-02 20:29:06'),
(9, 3, 'Computer desk', 0, '2026-05-02 20:29:06', '2026-05-02 20:29:06'),
(10, 3, 'Copenhagen weather', 0, '2026-05-02 20:29:06', '2026-05-02 20:29:06'),
(11, 4, 'A', 1, '2026-05-02 20:51:02', '2026-05-02 20:51:02'),
(12, 4, 'B', 0, '2026-05-02 20:51:02', '2026-05-02 20:51:02'),
(13, 4, 'C', 0, '2026-05-02 20:51:02', '2026-05-02 20:51:02'),
(14, 4, 'D', 0, '2026-05-02 20:51:02', '2026-05-02 20:51:02'),
(15, 5, 'A', 1, '2026-05-02 21:04:11', '2026-05-02 21:04:11'),
(16, 5, 'B', 0, '2026-05-02 21:04:11', '2026-05-02 21:04:11'),
(17, 5, 'C', 0, '2026-05-02 21:04:11', '2026-05-02 21:04:11'),
(18, 5, 'D', 0, '2026-05-02 21:04:11', '2026-05-02 21:04:11'),
(19, 6, 'A', 1, '2026-05-02 21:29:33', '2026-05-02 21:29:33'),
(20, 6, 'D', 0, '2026-05-02 21:29:33', '2026-05-02 21:29:33'),
(21, 6, 'G', 0, '2026-05-02 21:29:33', '2026-05-02 21:29:33'),
(22, 6, 'A', 0, '2026-05-02 21:29:33', '2026-05-02 21:29:33');

-- --------------------------------------------------------

--
-- Table structure for table `parent_guardians`
--

CREATE TABLE `parent_guardians` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `relationship` varchar(255) NOT NULL,
  `phone_number` varchar(255) NOT NULL,
  `alternative_phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `occupation` varchar(255) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` enum('tuition','hostel','library','other') NOT NULL DEFAULT 'other',
  `description` varchar(255) DEFAULT NULL,
  `reference` varchar(255) NOT NULL,
  `status` enum('pending','paid','failed') NOT NULL DEFAULT 'pending',
  `payment_method` varchar(255) DEFAULT NULL,
  `transaction_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `student_id`, `amount`, `type`, `description`, `reference`, `status`, `payment_method`, `transaction_date`, `created_at`, `updated_at`) VALUES
(1, 3, 155000.00, 'tuition', 'Tuition Fee - Semester 1', 'TXN-K2301', 'paid', 'card', '2025-10-08 18:16:52', '2025-10-08 18:16:52', '2026-02-08 18:16:52'),
(2, 3, 12500.00, 'other', 'Departmental Development Levy', 'TXN-K2302', 'pending', NULL, NULL, '2026-02-06 18:16:52', '2026-02-08 18:16:52'),
(3, 3, 15000.00, 'other', 'ICT Resource Fee', 'TXN-K2303', 'paid', 'bank_transfer', '2025-12-08 18:16:52', '2025-12-08 18:16:52', '2026-02-08 18:16:52'),
(4, 3, 45000.00, 'hostel', 'Hostel Maintenance', 'TXN-K2304', 'failed', 'card', '2025-10-08 18:16:52', '2025-10-08 18:16:52', '2026-02-08 18:16:52'),
(5, 3, 5000.00, 'library', 'Library Access Fee', 'TXN-K2305', 'paid', 'card', '2025-11-08 18:16:52', '2025-11-08 18:16:52', '2026-02-08 18:16:52');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permission_role`
--

CREATE TABLE `permission_role` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 1, 'auth_token', '8a388ac3b3cbb12d60fe5393a66b65ac56a743a59a68696f30a2af59e412449d', '[\"*\"]', '2026-01-16 19:38:12', NULL, '2026-01-16 19:35:42', '2026-01-16 19:38:12'),
(2, 'App\\Models\\User', 1, 'auth_token', '269739117ab8e28d3aaf5156996e6f44051e171acfdf7d92317fdb397e3f9cf5', '[\"*\"]', '2026-01-16 19:39:31', NULL, '2026-01-16 19:39:29', '2026-01-16 19:39:31'),
(3, 'App\\Models\\User', 3, 'auth_token', 'e6a12913da2c2a089a625dee394e181ea59f448aa1f0ef39763cb76f179752a5', '[\"*\"]', '2026-01-16 19:40:09', NULL, '2026-01-16 19:40:07', '2026-01-16 19:40:09'),
(4, 'App\\Models\\User', 1, 'auth_token', '3be4d74c7b1edabd75df7c6d14971972645b8b6a6e1e9965f26d36e2556d353e', '[\"*\"]', '2026-01-16 20:00:45', NULL, '2026-01-16 20:00:42', '2026-01-16 20:00:45'),
(5, 'App\\Models\\User', 3, 'auth_token', '4fed4e44b4441c61885c256a0336826f092093c7ebcf5a203e641960a7e27721', '[\"*\"]', '2026-01-16 20:07:10', NULL, '2026-01-16 20:06:04', '2026-01-16 20:07:10'),
(6, 'App\\Models\\User', 3, 'auth_token', '7b15bec1ec3487f798094cbf5e83c9ccfad4695a8d731068e17d77af3893135e', '[\"*\"]', '2026-01-19 11:25:56', NULL, '2026-01-16 20:15:30', '2026-01-19 11:25:56'),
(7, 'App\\Models\\User', 7, 'auth_token', 'c7ca75a5f98c178c5a092f6811d62095e3df68579a24f25628b8ed4961b205bb', '[\"*\"]', '2026-01-18 09:24:58', NULL, '2026-01-18 09:04:19', '2026-01-18 09:24:58'),
(8, 'App\\Models\\User', 3, 'auth_token', '5b311cf28215511e4bb0b016fa860770f56c8fe737cc80e1a253b31c8b1ac295', '[\"*\"]', '2026-01-18 09:30:59', NULL, '2026-01-18 09:25:44', '2026-01-18 09:30:59'),
(9, 'App\\Models\\User', 3, 'auth_token', 'd5626f16e86afd7450ffb9483ebae301cecebc69dce939bfbe10fa6fdd6df80d', '[\"*\"]', '2026-01-18 09:31:37', NULL, '2026-01-18 09:31:36', '2026-01-18 09:31:37'),
(10, 'App\\Models\\User', 3, 'auth_token', 'b4e652d9e211faf3d97d21eed63fb712d14bf390b1602cc96bafcece43d79b84', '[\"*\"]', '2026-01-18 10:04:10', NULL, '2026-01-18 09:32:41', '2026-01-18 10:04:10'),
(11, 'App\\Models\\User', 8, 'auth_token', '5318a9502353a8c8b4a0cd544c41c94f1f9c790a4730ba03518a2594ce891351', '[\"*\"]', '2026-01-18 10:20:00', NULL, '2026-01-18 10:07:27', '2026-01-18 10:20:00'),
(12, 'App\\Models\\User', 9, 'auth_token', 'e110dda619f0b6c876a25d0a22e685817e2d5044add0adf3ba67620ad8f3ecda', '[\"*\"]', '2026-01-19 11:38:20', NULL, '2026-01-18 10:34:31', '2026-01-19 11:38:20'),
(13, 'App\\Models\\User', 10, 'auth_token', 'e095592ae75643a02e5eb33aba019f0a6e2d7cf7927e8c39054e8275cd8ef4b9', '[\"*\"]', '2026-01-19 11:43:26', NULL, '2026-01-19 11:43:23', '2026-01-19 11:43:26'),
(14, 'App\\Models\\User', 1, 'auth_token', 'b1a3f6a1375fcd0c01ab62937d528d58b16e2fe3d4d6255a12a3e9a8c1d34d3f', '[\"*\"]', '2026-01-19 11:45:25', NULL, '2026-01-19 11:45:09', '2026-01-19 11:45:25'),
(15, 'App\\Models\\User', 3, 'auth_token', '40b5edc2e5241b1a93eb447d2541aa6d8dddd6a3d8a7c1ea9e3e194ccc385f88', '[\"*\"]', '2026-02-10 10:31:11', NULL, '2026-02-08 11:43:07', '2026-02-10 10:31:11'),
(16, 'App\\Models\\User', 2, 'auth_token', 'dd539daa8b263086c6dcdf513f7a72feeb8a6a64ef3135c21ed13ed116d47a9d', '[\"*\"]', '2026-02-10 14:56:50', NULL, '2026-02-10 10:34:32', '2026-02-10 14:56:50'),
(17, 'App\\Models\\User', 11, 'auth_token', 'ae8b24281bd5feec304a41531823f6893d30bfad28413afb6563aa278f76cc55', '[\"*\"]', '2026-02-10 15:11:50', NULL, '2026-02-10 14:59:45', '2026-02-10 15:11:50'),
(18, 'App\\Models\\User', 2, 'auth_token', 'd33f6bf2c19dda59ba6f6d397a03644ad9131f38424724d2a1df05dec348452a', '[\"*\"]', '2026-02-10 15:57:42', NULL, '2026-02-10 15:16:10', '2026-02-10 15:57:42'),
(19, 'App\\Models\\User', 2, 'auth_token', 'ae7d99c386596fe9bbd8fbf5a8419c861a3aeeac30fd58d3e0f7467b6fbda2ce', '[\"*\"]', '2026-02-10 16:11:27', NULL, '2026-02-10 15:58:19', '2026-02-10 16:11:27'),
(20, 'App\\Models\\User', 2, 'auth_token', '21abefd9092b0274dbbf502fc68fd196dfd48d7a5099a5a1cec30d2d4414bfb2', '[\"*\"]', '2026-02-22 20:11:57', NULL, '2026-02-10 17:30:44', '2026-02-22 20:11:57'),
(21, 'App\\Models\\User', 3, 'auth_token', 'f85f75e1859c46668fadaa2b57f4dc49f0958fbaba534b4c2dddd57e3dfb4321', '[\"*\"]', '2026-02-22 20:34:58', NULL, '2026-02-22 20:12:49', '2026-02-22 20:34:58'),
(22, 'App\\Models\\User', 12, 'auth_token', 'c136a58f0800fd80d2c3b0b9108c1941467e35f1cd140e29254f0e31a05663b1', '[\"*\"]', '2026-02-23 05:13:00', NULL, '2026-02-23 04:06:04', '2026-02-23 05:13:00'),
(23, 'App\\Models\\User', 3, 'auth_token', 'b00507ae4691062a950d42431d9bd02c5d48aaa6bbdff8e8e8aad72cb7132d16', '[\"*\"]', '2026-02-23 11:45:41', NULL, '2026-02-23 11:31:18', '2026-02-23 11:45:41'),
(24, 'App\\Models\\User', 2, 'auth_token', '1ce59819c10ecdd684d9d2a3892f5ea6d6519ab5727cc4ed4201148b17768857', '[\"*\"]', '2026-02-23 11:48:36', NULL, '2026-02-23 11:46:03', '2026-02-23 11:48:36'),
(25, 'App\\Models\\User', 1, 'auth_token', '1f08f9bbbc1e9142adcc7d4ddd3dc568edb949c113b8e67121253fd26a8cc70f', '[\"*\"]', '2026-02-24 00:23:02', NULL, '2026-02-23 11:49:07', '2026-02-24 00:23:02'),
(26, 'App\\Models\\User', 13, 'auth_token', 'f7b900af763680b33e92fb8d611751d40536a106a42ddf0de03d8cb507ce4344', '[\"*\"]', '2026-04-21 20:06:07', NULL, '2026-04-21 20:03:18', '2026-04-21 20:06:07'),
(27, 'App\\Models\\User', 1, 'auth_token', '57e842738d0b3fae89808c70e691ca1ad02fa545794509c20d91803baf2b5ac9', '[\"*\"]', '2026-04-21 20:09:15', NULL, '2026-04-21 20:06:43', '2026-04-21 20:09:15'),
(28, 'App\\Models\\User', 1, 'auth_token', '09f57a8bace78659ac9ca3a43d7289b1f6f710f6a282def3f845946294a7d954', '[\"*\"]', '2026-04-21 20:30:23', NULL, '2026-04-21 20:10:58', '2026-04-21 20:30:23'),
(29, 'App\\Models\\User', 13, 'auth_token', '0d5a9321ffde501d40b5682bc3b33d908039131befec53432030cb65fc41c489', '[\"*\"]', '2026-04-21 20:30:59', NULL, '2026-04-21 20:30:52', '2026-04-21 20:30:59'),
(30, 'App\\Models\\User', 2, 'auth_token', 'a5228cfe522db2e0501c664a3e938f5b28c4b6168d02d924bd07fc74df7f9972', '[\"*\"]', '2026-04-21 20:36:36', NULL, '2026-04-21 20:32:54', '2026-04-21 20:36:36'),
(31, 'App\\Models\\User', 1, 'auth_token', 'c313eeefea82904343f1c0dec8ec7ee9fbc5f0d6d5bb29d2c8d652fd3a20cd3d', '[\"*\"]', '2026-04-21 20:37:45', NULL, '2026-04-21 20:37:28', '2026-04-21 20:37:45'),
(32, 'App\\Models\\User', 2, 'auth_token', '3bf77a7a6e00d808a5e2141adbb49447f068fad06916f7a4c80662142e8af792', '[\"*\"]', '2026-04-21 20:40:16', NULL, '2026-04-21 20:39:55', '2026-04-21 20:40:16'),
(33, 'App\\Models\\User', 13, 'auth_token', 'cecc917703344718c7c8eaaab0f0e453e1a1095d2aa601ca573ed4ba6518d42f', '[\"*\"]', '2026-04-21 20:44:22', NULL, '2026-04-21 20:41:45', '2026-04-21 20:44:22'),
(34, 'App\\Models\\User', 1, 'auth_token', '7586abdd1c8f13d0c9772fb8fb336bed0fc6a4495ee9e3a4c91e32105af43943', '[\"*\"]', '2026-04-21 21:09:56', NULL, '2026-04-21 20:49:50', '2026-04-21 21:09:56'),
(35, 'App\\Models\\User', 2, 'auth_token', 'd78d579693eee67ec8b6e431a884b4d63ac4b25a67bd9e537ea2a8ddf33dc692', '[\"*\"]', '2026-04-21 21:29:29', NULL, '2026-04-21 21:10:08', '2026-04-21 21:29:29'),
(36, 'App\\Models\\User', 13, 'auth_token', '574793c222b294c51abd41378d855e6f48382acfa2e1a142e9dbb5269f639b05', '[\"*\"]', '2026-04-21 21:32:25', NULL, '2026-04-21 21:32:02', '2026-04-21 21:32:25'),
(37, 'App\\Models\\User', 1, 'auth_token', '3e194f0918922bd20dd9894f1175793c1e7a10f7253ae5294835b38b177b1798', '[\"*\"]', '2026-05-01 15:41:40', NULL, '2026-04-21 21:34:05', '2026-05-01 15:41:40'),
(38, 'App\\Models\\User', 1, 'auth_token', '09951b985150578bdda67d460e830d04fcbd199d7fe94999ee6a55bcaaf2a542', '[\"*\"]', '2026-05-01 15:43:51', NULL, '2026-05-01 15:42:11', '2026-05-01 15:43:51'),
(39, 'App\\Models\\User', 15, 'auth_token', '06ea25c3cc598aea78c6b7207e64a96f4df52a5e49f281c457211763bce1da8c', '[\"*\"]', '2026-05-01 15:53:16', NULL, '2026-05-01 15:44:21', '2026-05-01 15:53:16'),
(40, 'App\\Models\\User', 3, 'auth_token', '7b4336a1b8f98928d8973b798ef6627e7b0ddf19c2999e9e265093b1367bfcaa', '[\"*\"]', '2026-05-01 15:54:17', NULL, '2026-05-01 15:54:10', '2026-05-01 15:54:17'),
(41, 'App\\Models\\User', 1, 'auth_token', '95a6764f98aaa23ff2b0e1618a59a879b9d2a31f59cf896bf31033a42d0a3668', '[\"*\"]', '2026-05-01 15:55:49', NULL, '2026-05-01 15:54:51', '2026-05-01 15:55:49'),
(42, 'App\\Models\\User', 2, 'auth_token', 'c197ee9c41e50535fa30cb28e5e174fb79d3402d88fe9b7e525d8aabf35ea413', '[\"*\"]', '2026-05-01 16:03:21', NULL, '2026-05-01 15:56:22', '2026-05-01 16:03:21'),
(43, 'App\\Models\\User', 3, 'auth_token', '225155655bee7f23fd4edaa648904526484baa5fb1baccca79181712fdb73eb9', '[\"*\"]', '2026-05-02 09:06:19', NULL, '2026-05-01 16:07:24', '2026-05-02 09:06:19'),
(44, 'App\\Models\\User', 2, 'auth_token', 'fb9ada4e3cdac4e8abcfbc80cf6c02a7c15846a2a68d3161b77b26b5660c0ce7', '[\"*\"]', '2026-05-02 09:08:41', NULL, '2026-05-02 09:06:44', '2026-05-02 09:08:41'),
(45, 'App\\Models\\User', 3, 'auth_token', 'dff9827051a2b6b58c2cb01526e90124cbbd2124362ed3411ca6c8c4980300b3', '[\"*\"]', '2026-05-02 10:48:31', NULL, '2026-05-02 09:09:04', '2026-05-02 10:48:31'),
(46, 'App\\Models\\User', 2, 'auth_token', '6f7284e6e01288185f4e6327d5a25649054a6435bf5b07091e8a02cc04733acb', '[\"*\"]', '2026-05-02 10:53:44', NULL, '2026-05-02 10:49:03', '2026-05-02 10:53:44'),
(47, 'App\\Models\\User', 3, 'auth_token', 'a1a4409fd4940e966f52534c67717d99f12ff86a27d354a2596bfcdb70a0573b', '[\"*\"]', '2026-05-02 10:54:22', NULL, '2026-05-02 10:54:15', '2026-05-02 10:54:22'),
(48, 'App\\Models\\User', 2, 'auth_token', '2b1b8b86dd45f9d7737a437b6660edbc18cfaf9936b6803b1dcbd5f9eac74be6', '[\"*\"]', '2026-05-02 19:36:01', NULL, '2026-05-02 10:55:06', '2026-05-02 19:36:01'),
(49, 'App\\Models\\User', 3, 'auth_token', '0a5af56332abb3d5422acf30344c2a6e39a3ac5580f11175878ae25e0a7d1372', '[\"*\"]', '2026-05-02 19:45:20', NULL, '2026-05-02 19:36:32', '2026-05-02 19:45:20'),
(50, 'App\\Models\\User', 2, 'auth_token', '5f0ee6dc80bd13f55b03477a5b06b3480d42f5fd1f7e37642ab9007525f1022b', '[\"*\"]', '2026-05-02 19:49:36', NULL, '2026-05-02 19:49:15', '2026-05-02 19:49:36'),
(51, 'App\\Models\\User', 3, 'auth_token', 'd0b6f185a91e568d78630cb694afc9e9c3dd5b9156cc8e1617f96158306ce9c1', '[\"*\"]', '2026-05-02 20:05:59', NULL, '2026-05-02 19:49:52', '2026-05-02 20:05:59'),
(52, 'App\\Models\\User', 2, 'auth_token', 'caff8df02470b6f5a30d7efa0fa8f07152491b77ac18d5002525e5a0c023ee43', '[\"*\"]', '2026-05-02 20:08:11', NULL, '2026-05-02 20:06:21', '2026-05-02 20:08:11'),
(53, 'App\\Models\\User', 3, 'auth_token', 'e21e1dd5a9da78e7b1eca464ee0b90268f111540b44538406e3576a909bc50fa', '[\"*\"]', '2026-05-02 20:20:36', NULL, '2026-05-02 20:08:29', '2026-05-02 20:20:36'),
(54, 'App\\Models\\User', 2, 'auth_token', 'd4db0dfee137cd14b7b70c222f7d53e52704d0ed4ab19aefd05dc84856512a2f', '[\"*\"]', '2026-05-02 20:29:04', NULL, '2026-05-02 20:23:00', '2026-05-02 20:29:04'),
(55, 'App\\Models\\User', 3, 'auth_token', '47f5efc78e8227e7480ff6a51bec7c62bfe629022cd4fd20280ca5451e0c80f4', '[\"*\"]', '2026-05-02 20:47:40', NULL, '2026-05-02 20:29:34', '2026-05-02 20:47:40'),
(56, 'App\\Models\\User', 2, 'auth_token', 'f0524ec55e5f7367b9c80bf79bc0768f765a2fe107bbdaee32b9f5430043b194', '[\"*\"]', '2026-05-02 20:51:02', NULL, '2026-05-02 20:48:44', '2026-05-02 20:51:02'),
(57, 'App\\Models\\User', 3, 'auth_token', '60ab789294dee03e4d41e85726dd838e3b8515360beb1a35faa703ad8bdee0e8', '[\"*\"]', '2026-05-02 21:02:19', NULL, '2026-05-02 20:51:36', '2026-05-02 21:02:19'),
(58, 'App\\Models\\User', 2, 'auth_token', 'a32e7f871782f70a2438fc8e52205ea7c1616c7b920c30ddde33ed83ef63be5c', '[\"*\"]', '2026-05-02 21:04:34', NULL, '2026-05-02 21:02:43', '2026-05-02 21:04:34'),
(59, 'App\\Models\\User', 3, 'auth_token', '2e3a2d4ba9c2f777050bca592932076a8d90ce3b9a958af81e3f904ba1ed2e5a', '[\"*\"]', '2026-05-02 21:26:36', NULL, '2026-05-02 21:04:52', '2026-05-02 21:26:36'),
(60, 'App\\Models\\User', 2, 'auth_token', 'e7333f4ae8e5155ce189ea9555c7c2fe6f9a1fdbdfac5fb99e0086e564dc8ca7', '[\"*\"]', '2026-05-02 21:29:50', NULL, '2026-05-02 21:27:42', '2026-05-02 21:29:50'),
(61, 'App\\Models\\User', 3, 'auth_token', '94acaad214999e02476e70488f56ef3bbe37dffc40f8e7b77344d4144e2c55e2', '[\"*\"]', '2026-05-02 21:37:37', NULL, '2026-05-02 21:30:13', '2026-05-02 21:37:37');

-- --------------------------------------------------------

--
-- Table structure for table `polls`
--

CREATE TABLE `polls` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `association_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `starts_at` timestamp NULL DEFAULT NULL,
  `ends_at` timestamp NULL DEFAULT NULL,
  `allow_multiple_votes` tinyint(1) NOT NULL DEFAULT 0,
  `show_results_before_voting` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `poll_options`
--

CREATE TABLE `poll_options` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `poll_id` bigint(20) UNSIGNED NOT NULL,
  `option_text` varchar(255) NOT NULL,
  `votes_count` int(11) NOT NULL DEFAULT 0,
  `order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `poll_votes`
--

CREATE TABLE `poll_votes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `poll_id` bigint(20) UNSIGNED NOT NULL,
  `option_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `voted_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `association_id` bigint(20) UNSIGNED DEFAULT NULL,
  `content` text NOT NULL,
  `media_path` varchar(255) DEFAULT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'social',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `programmes`
--

CREATE TABLE `programmes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `department_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `degree_type` varchar(255) DEFAULT NULL,
  `duration` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `programmes`
--

INSERT INTO `programmes` (`id`, `department_id`, `name`, `degree_type`, `duration`, `description`, `created_at`, `updated_at`) VALUES
(1, 1, 'M.B.B.S Medicine and Surgery', NULL, NULL, NULL, '2026-02-08 09:57:33', '2026-02-08 09:57:33'),
(2, 2, 'B.NSC. Nursing Science', NULL, NULL, NULL, '2026-02-08 09:57:33', '2026-02-08 09:57:33'),
(3, 3, 'D. PT Physiotherapy', NULL, NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(4, 4, 'B.Sc. Radiography', NULL, NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(5, 5, 'B.MLS. Medical Laboratory Science', NULL, NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(6, 6, 'B.Sc. Health Information Management', NULL, NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(7, 7, 'B. Agriculture', NULL, NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(8, 8, 'B. Sc. Animal & Environmental Biology', NULL, NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(9, 9, 'B.Sc Biotechnology', NULL, NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(10, 10, 'B. Sc. Plant Science & Biotechnology', NULL, NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(11, 11, 'B. Sc. Computer Science', NULL, NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(12, 12, 'B. Sc. Mathematics', NULL, NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(13, 13, 'B. Sc. Statistics', NULL, NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(14, 14, 'B. Sc. Chemistry', NULL, NULL, NULL, '2026-02-08 09:57:34', '2026-02-08 09:57:34'),
(15, 15, 'B. Sc. Physics', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(16, 16, 'B.SC. Biochemistry', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(17, 17, 'B. Sc. Accounting', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(18, 18, 'B. Sc. Business Administration', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(19, 19, 'B. Sc. Economics', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(20, 20, 'B. Sc. Criminology and Security Studies', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(21, 21, 'B. Sc. Geography', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(22, 22, 'B. Sc. Mass Communication', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(23, 23, 'B Sc. Public Administration', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(24, 24, 'B. Sc. Political Science', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(25, 25, 'B. Sc. Peace Studies & Conflict Resolution', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(26, 26, 'B. Sc. Sociology', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(27, 27, 'B. A. (Ed.) Education/English', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(28, 28, 'B. A. (Ed.) Education/Islamic Studies', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(29, 29, 'B.Sc.(Ed.) Education/Economics', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(30, 30, 'B.Sc.(Ed.) Education/Mathematics', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(31, 31, 'B.Sc.(Ed.) Education/Physics', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(32, 32, 'B.Sc.(Ed.) Education/Computer Science', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(33, 33, 'B.Sc.(Ed.) Education/Chemistry', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(34, 34, 'B.Sc.(Ed.) Education/Biology', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(35, 35, 'B.A. English Language', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(36, 36, 'B.A. Literature in English', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35'),
(37, 37, 'B.A. Islamic Studies', NULL, NULL, NULL, '2026-02-08 09:57:35', '2026-02-08 09:57:35');

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `exam_id` bigint(20) UNSIGNED NOT NULL,
  `question_text` text NOT NULL,
  `question_image` varchar(255) DEFAULT NULL,
  `type` enum('objective','theory') NOT NULL DEFAULT 'objective',
  `marks` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `exam_id`, `question_text`, `question_image`, `type`, `marks`, `created_at`, `updated_at`) VALUES
(1, 1, 'What is TP', NULL, 'objective', 2, '2026-05-02 19:36:03', '2026-05-02 19:36:03'),
(2, 2, 'What is it', NULL, 'objective', 50, '2026-05-02 20:08:11', '2026-05-02 20:08:11'),
(3, 3, 'What is computer', NULL, 'objective', 8, '2026-05-02 20:29:06', '2026-05-02 20:29:06'),
(4, 4, 'Test', NULL, 'objective', 100, '2026-05-02 20:51:02', '2026-05-02 20:51:02'),
(5, 5, 'Whehgw', NULL, 'objective', 2, '2026-05-02 21:04:11', '2026-05-02 21:04:11'),
(6, 6, 'Www', NULL, 'objective', 2, '2026-05-02 21:29:33', '2026-05-02 21:29:33');

-- --------------------------------------------------------

--
-- Table structure for table `quizzes`
--

CREATE TABLE `quizzes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `time_limit` int(11) DEFAULT NULL,
  `max_attempts` int(11) NOT NULL DEFAULT 0,
  `show_answers` tinyint(1) NOT NULL DEFAULT 1,
  `is_published` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quiz_attempts`
--

CREATE TABLE `quiz_attempts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quiz_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `answers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`answers`)),
  `score` int(11) DEFAULT NULL,
  `total_questions` int(11) NOT NULL,
  `correct_answers` int(11) DEFAULT NULL,
  `started_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `time_taken` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `quiz_questions`
--

CREATE TABLE `quiz_questions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `quiz_id` bigint(20) UNSIGNED NOT NULL,
  `question_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `reportable_type` varchar(255) NOT NULL,
  `reportable_id` bigint(20) UNSIGNED NOT NULL,
  `reporter_id` bigint(20) UNSIGNED NOT NULL,
  `reason` varchar(255) NOT NULL,
  `status` enum('pending','reviewed','resolved') NOT NULL DEFAULT 'pending',
  `admin_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `role_user`
--

CREATE TABLE `role_user` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `school_info`
--

CREATE TABLE `school_info` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `school_name` varchar(255) NOT NULL DEFAULT 'Kashim Ibrahim University',
  `background` text DEFAULT NULL,
  `history` text DEFAULT NULL,
  `vision` text DEFAULT NULL,
  `mission` text DEFAULT NULL,
  `core_values` text DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `motto` varchar(255) DEFAULT NULL,
  `established_year` year(4) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `school_rules`
--

CREATE TABLE `school_rules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_directory`
--

CREATE TABLE `staff_directory` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `staff_id` varchar(255) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `surname` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `other_names` varchar(255) DEFAULT NULL,
  `position` varchar(255) NOT NULL,
  `faculty_id` bigint(20) UNSIGNED DEFAULT NULL,
  `department_id` bigint(20) UNSIGNED DEFAULT NULL,
  `office_location` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `specialization` text DEFAULT NULL,
  `qualifications` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_documents`
--

CREATE TABLE `student_documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `document_type` enum('admission_letter','birth_certificate','olevel_result','id_card','passport','other') NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_size` int(11) NOT NULL,
  `mime_type` varchar(255) NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `verified_by` bigint(20) UNSIGNED DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `verification_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_profiles`
--

CREATE TABLE `student_profiles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `faculty_id` bigint(20) UNSIGNED DEFAULT NULL,
  `department_id` bigint(20) UNSIGNED DEFAULT NULL,
  `programme_id` bigint(20) UNSIGNED DEFAULT NULL,
  `academic_session_id` bigint(20) UNSIGNED DEFAULT NULL,
  `level` varchar(255) DEFAULT NULL,
  `mode_of_study` varchar(255) DEFAULT NULL,
  `admission_year` varchar(255) DEFAULT NULL,
  `entry_mode` varchar(255) DEFAULT NULL,
  `student_status` varchar(255) NOT NULL DEFAULT 'active',
  `guardian_name` varchar(255) DEFAULT NULL,
  `guardian_relationship` varchar(255) DEFAULT NULL,
  `guardian_phone` varchar(255) DEFAULT NULL,
  `guardian_email` varchar(255) DEFAULT NULL,
  `guardian_address` text DEFAULT NULL,
  `admission_letter_path` varchar(255) DEFAULT NULL,
  `birth_certificate_path` varchar(255) DEFAULT NULL,
  `olevel_result_path` varchar(255) DEFAULT NULL,
  `id_card_path` varchar(255) DEFAULT NULL,
  `other_documents_path` text DEFAULT NULL,
  `created_by` varchar(255) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `device_info` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_profiles`
--

INSERT INTO `student_profiles` (`id`, `user_id`, `faculty_id`, `department_id`, `programme_id`, `academic_session_id`, `level`, `mode_of_study`, `admission_year`, `entry_mode`, `student_status`, `guardian_name`, `guardian_relationship`, `guardian_phone`, `guardian_email`, `guardian_address`, `admission_letter_path`, `birth_certificate_path`, `olevel_result_path`, `id_card_path`, `other_documents_path`, `created_by`, `ip_address`, `device_info`, `created_at`, `updated_at`) VALUES
(1, 3, NULL, 11, NULL, 1, '300', NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-16 19:34:26', '2026-02-08 09:12:00'),
(3, 8, 5, 32, 32, 1, '100', NULL, NULL, NULL, 'active', 'Hhhhhdhdh', 'Father', '070877777562', NULL, 'Mdind', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-18 10:07:27', '2026-01-18 10:08:22'),
(5, 10, 5, 32, 32, 1, '300', NULL, NULL, NULL, 'active', 'Hello', 'Yes', '0810868864', 'maryamhassanaliuah@gmail.com', 'Behhfbdhdd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-19 11:43:23', '2026-01-19 11:43:23'),
(7, 12, 5, 32, 32, 2, '200', NULL, NULL, NULL, 'active', 'Husseini', 'Father', '0808885522', NULL, 'Moromti Njimtilo', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-23 04:06:02', '2026-02-23 04:06:02'),
(8, 13, 5, 32, 32, 1, '200', NULL, NULL, NULL, 'active', 'Husseini Alhaji Mala', 'Father', '08066318533', 'hussainialhajimala@gmail.com', 'Moromti OPP 333 Barracks Maiduguri Borno State', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-21 20:03:17', '2026-04-21 20:03:17');

-- --------------------------------------------------------

--
-- Table structure for table `support_tickets`
--

CREATE TABLE `support_tickets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `admin_response` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_alerts`
--

CREATE TABLE `system_alerts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('critical','warning','info') NOT NULL DEFAULT 'info',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `severity` int(11) NOT NULL DEFAULT 1,
  `is_resolved` tinyint(1) NOT NULL DEFAULT 0,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tutorials`
--

CREATE TABLE `tutorials` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED DEFAULT NULL,
  `course_code` varchar(255) DEFAULT NULL,
  `uploaded_by` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_path` varchar(255) DEFAULT NULL,
  `file_type` varchar(255) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `youtube_video_id` varchar(255) DEFAULT NULL,
  `source_type` varchar(255) NOT NULL DEFAULT 'file',
  `views` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `status` enum('active','banned') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tutorials`
--

INSERT INTO `tutorials` (`id`, `course_id`, `course_code`, `uploaded_by`, `title`, `description`, `file_path`, `file_type`, `mime_type`, `file_size`, `youtube_video_id`, `source_type`, `views`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 2, 'Introduction to Computer Science', 'Introduction to Computer Science', 'tutorials/XLTx4XtMZuxh520lGQWDClporLUQ6L39nt7gIRZ7.mp4', 'video', 'video/mp4', 3593132, NULL, 'file', 5, 'active', '2026-05-01 16:03:28', '2026-05-02 21:15:52'),
(3, NULL, NULL, 3, 'Introduction To Computer System | Beginners Complete Introduction To Computer System', 'Introduction To Computer System. Beginners Complete Introduction To Computer System. Definition, Components, Features And ...', NULL, 'youtube', NULL, NULL, 'qfUZBKDh9BY', 'youtube', 7, 'active', '2026-05-02 10:14:16', '2026-05-02 21:10:59'),
(4, NULL, NULL, 3, 'What Is Computer || Definition of Computer #computer #definations', 'Definitions of computer and computer tips tricks educational knowledge shortcut keys computer abbreviations computer questions ...', NULL, 'youtube', NULL, NULL, 'mYKXZAGkIeE', 'youtube', 4, 'active', '2026-05-02 10:15:24', '2026-05-02 10:45:32'),
(5, NULL, NULL, 3, 'The Complete Web Development Roadmap', 'Go from zero to a full stack web developer in 12 months. This step-by-step roadmap covers the essential skills and latest ...', NULL, 'youtube', NULL, NULL, 'GxmfcnU3feo', 'youtube', 3, 'active', '2026-05-02 10:35:27', '2026-05-02 21:15:32'),
(6, NULL, NULL, 3, 'Introduction To PHP | What Is PHP Programming | PHP Tutorial For Beginners | Simplilearn', 'Discover SKillUP free online certification programs ...', NULL, 'youtube', NULL, NULL, 'KBT2gmAfav4', 'youtube', 2, 'active', '2026-05-02 10:47:41', '2026-05-02 19:45:19'),
(7, NULL, NULL, 3, 'What is Python? Why Python is So Popular?', 'What is Python? This short video explains it in 4 minutes. Python Tutorial for Beginners: https://youtu.be/_uQrJ0TkZlc Python ...', NULL, 'youtube', NULL, NULL, 'Y8Tko2YC5hA', 'youtube', 2, 'active', '2026-05-02 19:56:13', '2026-05-02 21:15:06'),
(8, NULL, NULL, 3, 'This Is Why Ethical Hackers Exist 💻', 'Welcome To Hackworld - Your Go-To For Hacker Stories Credits: Tommy G This video is for transformative purposes under ...', NULL, 'youtube', NULL, NULL, 'AU-y2LMyfPY', 'youtube', 2, 'active', '2026-05-02 21:22:30', '2026-05-02 21:32:20'),
(9, NULL, NULL, 3, 'Broken, Low and Struggling - Remembrance of Allah Helps - Mufti Menk', 'Zanzibar Motivational Evening All Official Links from the Mufti Menk Channel can be found here: ▻ https://muftimenk.com ...', NULL, 'youtube', NULL, NULL, 'uII03mQC4uU', 'youtube', 4, 'active', '2026-05-02 21:25:16', '2026-05-02 21:35:39'),
(10, NULL, 'CSC 404', 2, 'Testing', 'Testing', 'tutorials/3f7kSxofvL6rCrSpkAE28FTE7VIPCRgKN5pzBsTy.mp4', 'video', 'video/mp4', 5514292, NULL, 'file', 5, 'active', '2026-05-02 21:28:56', '2026-05-02 21:33:38'),
(11, NULL, NULL, 3, 'What Is Chemistry?', 'What is Chemistry? Explained using animations and illustration Video. ------------------------------------------------------- Support our ...', NULL, 'youtube', NULL, NULL, 't8x3wdXZGEY', 'youtube', 1, 'active', '2026-05-02 21:36:21', '2026-05-02 21:36:22');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `matric_number` varchar(255) DEFAULT NULL,
  `surname` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `other_names` varchar(255) DEFAULT NULL,
  `gender` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `nationality` varchar(255) DEFAULT NULL,
  `state_of_origin` varchar(255) DEFAULT NULL,
  `lga` varchar(255) DEFAULT NULL,
  `passport_photograph` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `alternative_phone_number` varchar(255) DEFAULT NULL,
  `residential_address` text DEFAULT NULL,
  `city` varchar(255) DEFAULT NULL,
  `state_of_residence` varchar(255) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'student',
  `account_status` varchar(255) NOT NULL DEFAULT 'active',
  `last_login_date` timestamp NULL DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `notification_preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`notification_preferences`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `user_id`, `matric_number`, `surname`, `first_name`, `other_names`, `gender`, `dob`, `nationality`, `state_of_origin`, `lga`, `passport_photograph`, `email`, `phone_number`, `alternative_phone_number`, `residential_address`, `city`, `state_of_residence`, `username`, `role`, `account_status`, `last_login_date`, `email_verified_at`, `password`, `remember_token`, `notification_preferences`, `created_at`, `updated_at`) VALUES
(1, 'ADMIN-001', NULL, 'Admin', 'System', NULL, 'Male', NULL, 'Nigerian', NULL, NULL, 'assets/defaults/avatar.png', 'admin@kiu.edu.ng', NULL, NULL, NULL, NULL, NULL, 'admin', 'admin', 'active', NULL, NULL, '$2y$12$ndl4OmxE1lbhuFS4RnTPi.k5tThmtLKpOErDhWJ8diXQyYcvXOh5q', NULL, NULL, '2026-01-16 19:30:09', '2026-01-16 19:34:32'),
(2, 'LEC-001', NULL, 'Ibrahim', 'Dr. Ali', NULL, 'Male', NULL, 'Nigerian', NULL, NULL, 'assets/defaults/avatar.png', 'lecturer@kiu.edu.ng', NULL, NULL, NULL, NULL, NULL, 'ali_lecturer', 'lecturer', 'active', NULL, NULL, '$2y$12$wzdShHlyMusrXyyxsuMj6eQUOq.Lc.QNtvVgIdFDMekhBTdoDZDjK', NULL, NULL, '2026-01-16 19:30:09', '2026-01-16 19:34:32'),
(3, 'STU-001', 'KIU/2023/CSC/001', 'Musa', 'Abubakar', NULL, 'Male', NULL, 'Nigerian', 'Kano', NULL, 'http://192.168.89.249:8000/storage/profile-photos/6988974dc5388_1770559309.jpeg', 'student@kiu.edu.ng', '08012345678', NULL, NULL, NULL, NULL, 'abubakar_musa', 'student', 'active', NULL, NULL, '$2y$12$Y/xnhLGHei54kfcQmxFEx.3XPY2HAuQgB2Ot5rFXwFz2m3/7yAvsm', NULL, NULL, '2026-01-16 19:30:10', '2026-02-08 13:01:49'),
(8, 'KIU-696CBEEF4E3B5', '222222', 'Modu', 'Bashir', NULL, 'Male', NULL, 'Nigerian', 'Borno', 'Mmc', NULL, 'modu@gmail.com', '07087745629', NULL, 'Moromti Njimtilo', NULL, NULL, NULL, 'student', 'active', NULL, NULL, '$2y$12$TF4469KNKNWcN74Wr2WFDednW2NSAxbDQfCiER8ItDV4A3Dhz/8o6', NULL, NULL, '2026-01-18 10:07:27', '2026-01-18 10:07:27'),
(10, 'KIU-696E26EAB711E', '22/02/05/340', 'Sheriff', 'Muhammad', NULL, 'Male', '2000-01-02', 'Nigerian', 'Borno', 'Maiduguri', NULL, 'muhammadsheriff@gmail.com', '08148604462', NULL, 'Hello workd', 'Maiduguri', 'Borno', NULL, 'student', 'active', NULL, NULL, '$2y$12$VjY3bDqz0q2eGZXmAvbXteBvvmgf3/Vmu2y9xPc4mJEQRKN7NbX3C', NULL, NULL, '2026-01-19 11:43:23', '2026-01-19 11:43:23'),
(12, 'KIU-699BE03A5F023', '555008555', 'Husseini', 'Umar', 'Alhaji', 'Male', '2000-02-02', 'Nigerian', 'Borno', 'Bama', 'http://192.168.149.249:8000/storage/profile-photos/699be037ef160_1771823159.jpeg', 'uahtechtube22@gmail.com', '08087745629', '08874555332258', 'Moromti Njimtilo', 'Bama', 'Borno', NULL, 'student', 'active', NULL, NULL, '$2y$12$OXBpzZhjMBYfRiq4FQyfAudaIZj0rcolaAVLAx2PLr28pUGqdzyaa', NULL, NULL, '2026-02-23 04:06:02', '2026-02-23 04:06:02'),
(13, 'KIU-69E7E614CCD34', '2222/024064', 'Husseini', 'Umar', 'Alhaji', 'Male', '2003-02-02', 'Nigerian', 'Borno', 'Bama', 'storage/profile-photos/69e7e613535c8_1776805395.jpeg', 'mhgrema123@gmail.com', '07087745628', '07040084401', 'Moromti OPP 333 Barracks Maiduguri Borno State', 'Bama', 'Borno', NULL, 'student', 'active', NULL, NULL, '$2y$12$jZJnWGOz.vfpKzfxrQO4o.Q09QzDrV/RyCJTYOpZLu9eHcHCx76f.', NULL, NULL, '2026-04-21 20:03:17', '2026-04-21 20:05:40'),
(14, NULL, NULL, 'Sheriff', 'Muhammad', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'muhammadsheriffsms@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, 'lecturer', 'active', NULL, NULL, '$2y$12$6MKBwN37XPcEcsxLdl9uJOaA8yMZE9ecB8NjAJHBk.W51zYI53EAm', NULL, NULL, '2026-04-21 20:51:04', '2026-04-21 20:51:04'),
(15, NULL, NULL, 'TECHTUBE', 'UAH', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'uah@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, 'lecturer', 'active', NULL, NULL, '$2y$12$S1iN4DWXnqII5ZlX8n.OkepVImavDxTiKoM6BJko0vSA5NOXFarba', NULL, NULL, '2026-05-01 15:43:38', '2026-05-01 15:43:38');

-- --------------------------------------------------------

--
-- Table structure for table `virtual_classes`
--

CREATE TABLE `virtual_classes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `course_id` bigint(20) UNSIGNED NOT NULL,
  `lecturer_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `scheduled_at` datetime NOT NULL,
  `duration` int(11) NOT NULL COMMENT 'Duration in minutes',
  `meeting_link` varchar(255) DEFAULT NULL,
  `recording_url` varchar(255) DEFAULT NULL,
  `status` enum('upcoming','active','ended') NOT NULL DEFAULT 'upcoming',
  `is_recorded` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `virtual_class_messages`
--

CREATE TABLE `virtual_class_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `virtual_class_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `message` text NOT NULL,
  `is_lecturer` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_calendar`
--
ALTER TABLE `academic_calendar`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `academic_events`
--
ALTER TABLE `academic_events`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `academic_sessions`
--
ALTER TABLE `academic_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `academic_sessions_name_unique` (`name`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `announcements_published_by_foreign` (`published_by`);

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assignments_course_id_foreign` (`course_id`),
  ADD KEY `assignments_lecturer_id_foreign` (`lecturer_id`);

--
-- Indexes for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `assignment_submissions_assignment_id_student_id_unique` (`assignment_id`,`student_id`),
  ADD KEY `assignment_submissions_student_id_foreign` (`student_id`),
  ADD KEY `assignment_submissions_graded_by_foreign` (`graded_by`);

--
-- Indexes for table `associations`
--
ALTER TABLE `associations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `association_members`
--
ALTER TABLE `association_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `association_members_association_id_user_id_unique` (`association_id`,`user_id`),
  ADD KEY `association_members_user_id_foreign` (`user_id`);

--
-- Indexes for table `attendances`
--
ALTER TABLE `attendances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attendances_virtual_class_id_foreign` (`virtual_class_id`),
  ADD KEY `attendances_user_id_foreign` (`user_id`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_logs_user_id_created_at_index` (`user_id`,`created_at`),
  ADD KEY `audit_logs_model_type_model_id_index` (`model_type`,`model_id`),
  ADD KEY `audit_logs_action_index` (`action`),
  ADD KEY `audit_logs_created_at_index` (`created_at`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `campus_locations`
--
ALTER TABLE `campus_locations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `comments_post_id_foreign` (`post_id`),
  ADD KEY `comments_user_id_foreign` (`user_id`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversations_group_id_foreign` (`group_id`);

--
-- Indexes for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `conversation_participants_conversation_id_user_id_unique` (`conversation_id`,`user_id`),
  ADD KEY `conversation_participants_user_id_foreign` (`user_id`);

--
-- Indexes for table `courses`
--
ALTER TABLE `courses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `courses_code_unique` (`code`),
  ADD KEY `courses_department_id_foreign` (`department_id`);

--
-- Indexes for table `course_allocations`
--
ALTER TABLE `course_allocations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_allocation` (`user_id`,`course_id`,`academic_session_id`),
  ADD KEY `course_allocations_course_id_foreign` (`course_id`),
  ADD KEY `course_allocations_academic_session_id_foreign` (`academic_session_id`);

--
-- Indexes for table `course_registrations`
--
ALTER TABLE `course_registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_registration` (`user_id`,`course_id`,`academic_session_id`),
  ADD KEY `course_registrations_course_id_foreign` (`course_id`),
  ADD KEY `course_registrations_academic_session_id_foreign` (`academic_session_id`);

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `departments_faculty_id_name_unique` (`faculty_id`,`name`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `events_association_id_foreign` (`association_id`),
  ADD KEY `events_created_by_foreign` (`created_by`);

--
-- Indexes for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `event_registrations_event_id_user_id_unique` (`event_id`,`user_id`),
  ADD KEY `event_registrations_user_id_foreign` (`user_id`);

--
-- Indexes for table `exams`
--
ALTER TABLE `exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exams_course_id_foreign` (`course_id`),
  ADD KEY `exams_academic_session_id_foreign` (`academic_session_id`),
  ADD KEY `exams_uploaded_by_foreign` (`uploaded_by`);

--
-- Indexes for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_attempts_exam_id_foreign` (`exam_id`),
  ADD KEY `exam_attempts_user_id_foreign` (`user_id`);

--
-- Indexes for table `exam_responses`
--
ALTER TABLE `exam_responses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_responses_exam_attempt_id_foreign` (`exam_attempt_id`),
  ADD KEY `exam_responses_question_id_foreign` (`question_id`),
  ADD KEY `exam_responses_selected_option_id_foreign` (`selected_option_id`);

--
-- Indexes for table `faculties`
--
ALTER TABLE `faculties`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `faculties_name_unique` (`name`),
  ADD UNIQUE KEY `faculties_code_unique` (`code`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `friendships`
--
ALTER TABLE `friendships`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `friendships_user_id_friend_id_unique` (`user_id`,`friend_id`),
  ADD KEY `friendships_friend_id_foreign` (`friend_id`);

--
-- Indexes for table `friend_requests`
--
ALTER TABLE `friend_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `friend_requests_sender_id_receiver_id_unique` (`sender_id`,`receiver_id`),
  ADD KEY `friend_requests_receiver_id_foreign` (`receiver_id`);

--
-- Indexes for table `general_attendance`
--
ALTER TABLE `general_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `general_attendance_student_id_attendance_date_unique` (`student_id`,`attendance_date`),
  ADD KEY `general_attendance_marked_by_foreign` (`marked_by`);

--
-- Indexes for table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `groups_creator_id_foreign` (`creator_id`);

--
-- Indexes for table `group_members`
--
ALTER TABLE `group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `group_members_group_id_user_id_unique` (`group_id`,`user_id`),
  ADD KEY `group_members_user_id_foreign` (`user_id`);

--
-- Indexes for table `hostels`
--
ALTER TABLE `hostels`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hostels_campus_location_id_foreign` (`campus_location_id`);

--
-- Indexes for table `hostel_beds`
--
ALTER TABLE `hostel_beds`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hostel_beds_hostel_room_id_foreign` (`hostel_room_id`),
  ADD KEY `hostel_beds_student_id_foreign` (`student_id`);

--
-- Indexes for table `hostel_bookings`
--
ALTER TABLE `hostel_bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hostel_bookings_hostel_room_id_foreign` (`hostel_room_id`),
  ADD KEY `hostel_bookings_payment_id_foreign` (`payment_id`),
  ADD KEY `hostel_bookings_student_id_status_index` (`student_id`,`status`);

--
-- Indexes for table `hostel_complaints`
--
ALTER TABLE `hostel_complaints`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hostel_complaints_hostel_room_id_foreign` (`hostel_room_id`),
  ADD KEY `hostel_complaints_student_id_status_index` (`student_id`,`status`),
  ADD KEY `hostel_complaints_hostel_id_index` (`hostel_id`);

--
-- Indexes for table `hostel_rooms`
--
ALTER TABLE `hostel_rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hostel_rooms_hostel_id_foreign` (`hostel_id`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `lecturer_profiles`
--
ALTER TABLE `lecturer_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `lecturer_profiles_staff_id_unique` (`staff_id`),
  ADD KEY `lecturer_profiles_user_id_foreign` (`user_id`),
  ADD KEY `lecturer_profiles_department_id_foreign` (`department_id`);

--
-- Indexes for table `library_resources`
--
ALTER TABLE `library_resources`
  ADD PRIMARY KEY (`id`),
  ADD KEY `library_resources_course_id_foreign` (`course_id`),
  ADD KEY `library_resources_uploaded_by_foreign` (`uploaded_by`),
  ADD KEY `library_resources_approved_by_foreign` (`approved_by`);

--
-- Indexes for table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `likes_post_id_user_id_unique` (`post_id`,`user_id`),
  ADD KEY `likes_user_id_foreign` (`user_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `messages_conversation_id_foreign` (`conversation_id`),
  ADD KEY `messages_user_id_foreign` (`user_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`);

--
-- Indexes for table `options`
--
ALTER TABLE `options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `options_question_id_foreign` (`question_id`);

--
-- Indexes for table `parent_guardians`
--
ALTER TABLE `parent_guardians`
  ADD PRIMARY KEY (`id`),
  ADD KEY `parent_guardians_student_id_foreign` (`student_id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payments_reference_unique` (`reference`),
  ADD KEY `payments_student_id_index` (`student_id`),
  ADD KEY `payments_status_index` (`status`),
  ADD KEY `payments_reference_index` (`reference`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_slug_unique` (`slug`),
  ADD KEY `permissions_category_index` (`category`);

--
-- Indexes for table `permission_role`
--
ALTER TABLE `permission_role`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `permission_role_role_id_foreign` (`role_id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `polls`
--
ALTER TABLE `polls`
  ADD PRIMARY KEY (`id`),
  ADD KEY `polls_association_id_foreign` (`association_id`),
  ADD KEY `polls_created_by_foreign` (`created_by`);

--
-- Indexes for table `poll_options`
--
ALTER TABLE `poll_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `poll_options_poll_id_foreign` (`poll_id`);

--
-- Indexes for table `poll_votes`
--
ALTER TABLE `poll_votes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `poll_votes_poll_id_user_id_option_id_unique` (`poll_id`,`user_id`,`option_id`),
  ADD KEY `poll_votes_option_id_foreign` (`option_id`),
  ADD KEY `poll_votes_user_id_foreign` (`user_id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `posts_user_id_foreign` (`user_id`),
  ADD KEY `posts_association_id_foreign` (`association_id`);

--
-- Indexes for table `programmes`
--
ALTER TABLE `programmes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `programmes_department_id_foreign` (`department_id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `questions_exam_id_foreign` (`exam_id`);

--
-- Indexes for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quizzes_course_id_foreign` (`course_id`),
  ADD KEY `quizzes_created_by_foreign` (`created_by`);

--
-- Indexes for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `quiz_attempts_quiz_id_foreign` (`quiz_id`),
  ADD KEY `quiz_attempts_student_id_foreign` (`student_id`);

--
-- Indexes for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `quiz_questions_quiz_id_question_id_unique` (`quiz_id`,`question_id`),
  ADD KEY `quiz_questions_question_id_foreign` (`question_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `reports_reporter_id_foreign` (`reporter_id`),
  ADD KEY `reports_reportable_type_reportable_id_index` (`reportable_type`,`reportable_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_slug_unique` (`slug`);

--
-- Indexes for table `role_user`
--
ALTER TABLE `role_user`
  ADD PRIMARY KEY (`role_id`,`user_id`),
  ADD KEY `role_user_user_id_foreign` (`user_id`);

--
-- Indexes for table `school_info`
--
ALTER TABLE `school_info`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `school_rules`
--
ALTER TABLE `school_rules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `staff_directory`
--
ALTER TABLE `staff_directory`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `staff_directory_staff_id_unique` (`staff_id`),
  ADD KEY `staff_directory_faculty_id_foreign` (`faculty_id`),
  ADD KEY `staff_directory_department_id_foreign` (`department_id`);

--
-- Indexes for table `student_documents`
--
ALTER TABLE `student_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_documents_student_id_foreign` (`student_id`),
  ADD KEY `student_documents_verified_by_foreign` (`verified_by`);

--
-- Indexes for table `student_profiles`
--
ALTER TABLE `student_profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_profiles_user_id_foreign` (`user_id`),
  ADD KEY `student_profiles_faculty_id_foreign` (`faculty_id`),
  ADD KEY `student_profiles_department_id_foreign` (`department_id`),
  ADD KEY `student_profiles_programme_id_foreign` (`programme_id`),
  ADD KEY `student_profiles_academic_session_id_foreign` (`academic_session_id`);

--
-- Indexes for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `support_tickets_user_id_foreign` (`user_id`);

--
-- Indexes for table `system_alerts`
--
ALTER TABLE `system_alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `system_alerts_resolved_by_foreign` (`resolved_by`),
  ADD KEY `system_alerts_is_resolved_index` (`is_resolved`),
  ADD KEY `system_alerts_type_index` (`type`),
  ADD KEY `system_alerts_severity_index` (`severity`),
  ADD KEY `system_alerts_created_at_index` (`created_at`);

--
-- Indexes for table `tutorials`
--
ALTER TABLE `tutorials`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tutorials_course_id_foreign` (`course_id`),
  ADD KEY `tutorials_uploaded_by_foreign` (`uploaded_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_user_id_unique` (`user_id`),
  ADD UNIQUE KEY `users_matric_number_unique` (`matric_number`),
  ADD UNIQUE KEY `users_username_unique` (`username`);

--
-- Indexes for table `virtual_classes`
--
ALTER TABLE `virtual_classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `virtual_classes_course_id_foreign` (`course_id`),
  ADD KEY `virtual_classes_lecturer_id_foreign` (`lecturer_id`);

--
-- Indexes for table `virtual_class_messages`
--
ALTER TABLE `virtual_class_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `virtual_class_messages_virtual_class_id_foreign` (`virtual_class_id`),
  ADD KEY `virtual_class_messages_user_id_foreign` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_calendar`
--
ALTER TABLE `academic_calendar`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `academic_events`
--
ALTER TABLE `academic_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `academic_sessions`
--
ALTER TABLE `academic_sessions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `associations`
--
ALTER TABLE `associations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `association_members`
--
ALTER TABLE `association_members`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendances`
--
ALTER TABLE `attendances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `campus_locations`
--
ALTER TABLE `campus_locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `course_allocations`
--
ALTER TABLE `course_allocations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `course_registrations`
--
ALTER TABLE `course_registrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `event_registrations`
--
ALTER TABLE `event_registrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exams`
--
ALTER TABLE `exams`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `exam_responses`
--
ALTER TABLE `exam_responses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `faculties`
--
ALTER TABLE `faculties`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `friendships`
--
ALTER TABLE `friendships`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `friend_requests`
--
ALTER TABLE `friend_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `general_attendance`
--
ALTER TABLE `general_attendance`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `groups`
--
ALTER TABLE `groups`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `group_members`
--
ALTER TABLE `group_members`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hostels`
--
ALTER TABLE `hostels`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hostel_beds`
--
ALTER TABLE `hostel_beds`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hostel_bookings`
--
ALTER TABLE `hostel_bookings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hostel_complaints`
--
ALTER TABLE `hostel_complaints`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hostel_rooms`
--
ALTER TABLE `hostel_rooms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lecturer_profiles`
--
ALTER TABLE `lecturer_profiles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `library_resources`
--
ALTER TABLE `library_resources`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=79;

--
-- AUTO_INCREMENT for table `options`
--
ALTER TABLE `options`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `parent_guardians`
--
ALTER TABLE `parent_guardians`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- AUTO_INCREMENT for table `polls`
--
ALTER TABLE `polls`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `poll_options`
--
ALTER TABLE `poll_options`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `poll_votes`
--
ALTER TABLE `poll_votes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `programmes`
--
ALTER TABLE `programmes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `quizzes`
--
ALTER TABLE `quizzes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `school_info`
--
ALTER TABLE `school_info`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `school_rules`
--
ALTER TABLE `school_rules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `staff_directory`
--
ALTER TABLE `staff_directory`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_documents`
--
ALTER TABLE `student_documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_profiles`
--
ALTER TABLE `student_profiles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_alerts`
--
ALTER TABLE `system_alerts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tutorials`
--
ALTER TABLE `tutorials`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `virtual_classes`
--
ALTER TABLE `virtual_classes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `virtual_class_messages`
--
ALTER TABLE `virtual_class_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `announcements_published_by_foreign` FOREIGN KEY (`published_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `assignments_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignments_lecturer_id_foreign` FOREIGN KEY (`lecturer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  ADD CONSTRAINT `assignment_submissions_assignment_id_foreign` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `assignment_submissions_graded_by_foreign` FOREIGN KEY (`graded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `assignment_submissions_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `association_members`
--
ALTER TABLE `association_members`
  ADD CONSTRAINT `association_members_association_id_foreign` FOREIGN KEY (`association_id`) REFERENCES `associations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `association_members_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendances`
--
ALTER TABLE `attendances`
  ADD CONSTRAINT `attendances_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `attendances_virtual_class_id_foreign` FOREIGN KEY (`virtual_class_id`) REFERENCES `virtual_classes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_post_id_foreign` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `conversations_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  ADD CONSTRAINT `conversation_participants_conversation_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `conversation_participants_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `courses`
--
ALTER TABLE `courses`
  ADD CONSTRAINT `courses_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_allocations`
--
ALTER TABLE `course_allocations`
  ADD CONSTRAINT `course_allocations_academic_session_id_foreign` FOREIGN KEY (`academic_session_id`) REFERENCES `academic_sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_allocations_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_allocations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `course_registrations`
--
ALTER TABLE `course_registrations`
  ADD CONSTRAINT `course_registrations_academic_session_id_foreign` FOREIGN KEY (`academic_session_id`) REFERENCES `academic_sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_registrations_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `course_registrations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `departments`
--
ALTER TABLE `departments`
  ADD CONSTRAINT `departments_faculty_id_foreign` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_association_id_foreign` FOREIGN KEY (`association_id`) REFERENCES `associations` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `events_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_registrations`
--
ALTER TABLE `event_registrations`
  ADD CONSTRAINT `event_registrations_event_id_foreign` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_registrations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exams`
--
ALTER TABLE `exams`
  ADD CONSTRAINT `exams_academic_session_id_foreign` FOREIGN KEY (`academic_session_id`) REFERENCES `academic_sessions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exams_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exams_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  ADD CONSTRAINT `exam_attempts_exam_id_foreign` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_attempts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exam_responses`
--
ALTER TABLE `exam_responses`
  ADD CONSTRAINT `exam_responses_exam_attempt_id_foreign` FOREIGN KEY (`exam_attempt_id`) REFERENCES `exam_attempts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_responses_question_id_foreign` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `exam_responses_selected_option_id_foreign` FOREIGN KEY (`selected_option_id`) REFERENCES `options` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `friendships`
--
ALTER TABLE `friendships`
  ADD CONSTRAINT `friendships_friend_id_foreign` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `friendships_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `friend_requests`
--
ALTER TABLE `friend_requests`
  ADD CONSTRAINT `friend_requests_receiver_id_foreign` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `friend_requests_sender_id_foreign` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `general_attendance`
--
ALTER TABLE `general_attendance`
  ADD CONSTRAINT `general_attendance_marked_by_foreign` FOREIGN KEY (`marked_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `general_attendance_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `groups_creator_id_foreign` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `group_members`
--
ALTER TABLE `group_members`
  ADD CONSTRAINT `group_members_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_members_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hostels`
--
ALTER TABLE `hostels`
  ADD CONSTRAINT `hostels_campus_location_id_foreign` FOREIGN KEY (`campus_location_id`) REFERENCES `campus_locations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hostel_beds`
--
ALTER TABLE `hostel_beds`
  ADD CONSTRAINT `hostel_beds_hostel_room_id_foreign` FOREIGN KEY (`hostel_room_id`) REFERENCES `hostel_rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hostel_beds_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `hostel_bookings`
--
ALTER TABLE `hostel_bookings`
  ADD CONSTRAINT `hostel_bookings_hostel_room_id_foreign` FOREIGN KEY (`hostel_room_id`) REFERENCES `hostel_rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hostel_bookings_payment_id_foreign` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `hostel_bookings_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hostel_complaints`
--
ALTER TABLE `hostel_complaints`
  ADD CONSTRAINT `hostel_complaints_hostel_id_foreign` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hostel_complaints_hostel_room_id_foreign` FOREIGN KEY (`hostel_room_id`) REFERENCES `hostel_rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hostel_complaints_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hostel_rooms`
--
ALTER TABLE `hostel_rooms`
  ADD CONSTRAINT `hostel_rooms_hostel_id_foreign` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lecturer_profiles`
--
ALTER TABLE `lecturer_profiles`
  ADD CONSTRAINT `lecturer_profiles_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `lecturer_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `library_resources`
--
ALTER TABLE `library_resources`
  ADD CONSTRAINT `library_resources_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `library_resources_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `library_resources_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_post_id_foreign` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `likes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_conversation_id_foreign` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `options`
--
ALTER TABLE `options`
  ADD CONSTRAINT `options_question_id_foreign` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `parent_guardians`
--
ALTER TABLE `parent_guardians`
  ADD CONSTRAINT `parent_guardians_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `permission_role`
--
ALTER TABLE `permission_role`
  ADD CONSTRAINT `permission_role_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `permission_role_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `polls`
--
ALTER TABLE `polls`
  ADD CONSTRAINT `polls_association_id_foreign` FOREIGN KEY (`association_id`) REFERENCES `associations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `polls_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `poll_options`
--
ALTER TABLE `poll_options`
  ADD CONSTRAINT `poll_options_poll_id_foreign` FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `poll_votes`
--
ALTER TABLE `poll_votes`
  ADD CONSTRAINT `poll_votes_option_id_foreign` FOREIGN KEY (`option_id`) REFERENCES `poll_options` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `poll_votes_poll_id_foreign` FOREIGN KEY (`poll_id`) REFERENCES `polls` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `poll_votes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_association_id_foreign` FOREIGN KEY (`association_id`) REFERENCES `associations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `posts_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `programmes`
--
ALTER TABLE `programmes`
  ADD CONSTRAINT `programmes_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `questions_exam_id_foreign` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quizzes`
--
ALTER TABLE `quizzes`
  ADD CONSTRAINT `quizzes_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quizzes_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_attempts`
--
ALTER TABLE `quiz_attempts`
  ADD CONSTRAINT `quiz_attempts_quiz_id_foreign` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_attempts_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `quiz_questions`
--
ALTER TABLE `quiz_questions`
  ADD CONSTRAINT `quiz_questions_question_id_foreign` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `quiz_questions_quiz_id_foreign` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_reporter_id_foreign` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_user`
--
ALTER TABLE `role_user`
  ADD CONSTRAINT `role_user_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_user_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `staff_directory`
--
ALTER TABLE `staff_directory`
  ADD CONSTRAINT `staff_directory_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `staff_directory_faculty_id_foreign` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_documents`
--
ALTER TABLE `student_documents`
  ADD CONSTRAINT `student_documents_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_documents_verified_by_foreign` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `student_profiles`
--
ALTER TABLE `student_profiles`
  ADD CONSTRAINT `student_profiles_academic_session_id_foreign` FOREIGN KEY (`academic_session_id`) REFERENCES `academic_sessions` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `student_profiles_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `student_profiles_faculty_id_foreign` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `student_profiles_programme_id_foreign` FOREIGN KEY (`programme_id`) REFERENCES `programmes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `student_profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `support_tickets`
--
ALTER TABLE `support_tickets`
  ADD CONSTRAINT `support_tickets_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `system_alerts`
--
ALTER TABLE `system_alerts`
  ADD CONSTRAINT `system_alerts_resolved_by_foreign` FOREIGN KEY (`resolved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `tutorials`
--
ALTER TABLE `tutorials`
  ADD CONSTRAINT `tutorials_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `virtual_classes`
--
ALTER TABLE `virtual_classes`
  ADD CONSTRAINT `virtual_classes_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `virtual_classes_lecturer_id_foreign` FOREIGN KEY (`lecturer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `virtual_class_messages`
--
ALTER TABLE `virtual_class_messages`
  ADD CONSTRAINT `virtual_class_messages_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `virtual_class_messages_virtual_class_id_foreign` FOREIGN KEY (`virtual_class_id`) REFERENCES `virtual_classes` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
