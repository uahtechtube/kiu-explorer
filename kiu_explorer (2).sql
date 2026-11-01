-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 29, 2026 at 10:52 PM
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

--
-- Dumping data for table `academic_calendar`
--

INSERT INTO `academic_calendar` (`id`, `title`, `description`, `type`, `start_date`, `end_date`, `academic_session`, `semester`, `color`, `is_public`, `created_at`, `updated_at`) VALUES
(1, 'First Semester Examination Period', 'End of semester examinations for all students.', 'exam', '2026-07-30', '2026-08-20', '2025/2026', 'First', '#EF4444', 1, '2026-05-30 16:28:30', '2026-05-30 16:28:30'),
(2, 'Matriculation Ceremony', 'Official induction ceremony for new students.', 'event', '2026-06-13', '2026-06-13', '2025/2026', 'First', '#3B82F6', 1, '2026-05-30 16:28:30', '2026-05-30 16:28:30'),
(3, 'First Semester Examination Period', 'End of semester examinations for all students.', 'exam', '2026-08-04', '2026-08-25', '2025/2026', 'First', '#EF4444', 1, '2026-06-04 10:43:33', '2026-06-04 10:43:33'),
(4, 'Matriculation Ceremony', 'Official induction ceremony for new students.', 'event', '2026-06-18', '2026-06-18', '2025/2026', 'First', '#3B82F6', 1, '2026-06-04 10:43:33', '2026-06-04 10:43:33');

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
(1, '2025/2026', 1, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(2, '2026/2027', 0, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30');

-- --------------------------------------------------------

--
-- Table structure for table `adverts`
--

CREATE TABLE `adverts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `media_type` enum('image','video','none') NOT NULL DEFAULT 'none',
  `media_url` varchar(255) DEFAULT NULL,
  `external_link` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `adverts`
--

INSERT INTO `adverts` (`id`, `title`, `content`, `media_type`, `media_url`, `external_link`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
(2, 'Hello guys are you ok', 'Hello guys are you ok to come to the shop for a coffee and a coffee and a drink with the kids to go to the pub for a bit of the code to get the questions and answers and then you can get it done and then you can get it from the pass to the other person who is the only person who knows what is the reason for me to do it and I can do it and I can do it and I can do it and I can do it and I can do it and I can do it and I can do it and I can get it from the pass to the same thing as the same thing as the same thing as the same thing as the same thing as the person who knows what they say is the same thing as the same thing as the same as you to be the only things that you are not 🚭🚭🚭🚭 and you can always be in the same thing as the same thing as the same thing as the most important things I do it and it needs being a good 👍👍 I think it\'s not that good for him and his Gmail and also to be honest with me and you can understand it to be the same thing as dhdbr', 'video', 'adverts/3dae94be-ba41-44d9-a34f-164d0e5c1d50.mp4', 'https://www.globalsouthopportunities.com/2026/06/02/afcfta-6/', 0, 1, '2026-06-04 08:50:21', '2026-06-04 11:13:20'),
(3, 'Testing testing', 'How are you doing today Insha Allah is the use of a new one for you and your y you need to be in touch with the kids in the staff room or the house and it doesn\'t work for you and I can get it and I don\'t want it to do it with you to be careful and also add it to the same person who lives in a house for me', 'image', 'adverts/c92090db-5f85-4471-b46c-86079deda0a3.jpg', 'https://www.globalsouthopportunities.com/2026/06/02/afcfta-6/', 1, 1, '2026-06-04 08:51:03', '2026-06-04 08:51:03'),
(4, 'Test block 1 gg 1', 'Use the Google maps and you have any thing you want me the pic to say that i was in i compare it with the four picture 🖼️ in my phone 🤳 and also the same email is on my love to the other person I can get the same as you and the kids to be in a good mood so you need a policy to do that for me too and you are you and your self into your life 🧬 I don\'t understand how are you and the kids to do the right thing as they don\'t have it in their own', 'image', 'adverts/711979ec-0bc3-45e0-ac46-e351d2013220.jpg', 'https://www.globalsouthopportunities.com/2026/06/02/afcfta-6/', 1, 1, '2026-06-04 08:57:45', '2026-06-04 08:57:45');

-- --------------------------------------------------------

--
-- Table structure for table `ai_conversations`
--

CREATE TABLE `ai_conversations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_conversations`
--

INSERT INTO `ai_conversations` (`id`, `user_id`, `title`, `created_at`, `updated_at`) VALUES
(2, 3, 'Please explain this to me', '2026-06-04 09:50:31', '2026-06-04 09:50:31'),
(3, 3, 'Please analyse this image and explain it...', '2026-06-04 11:07:29', '2026-06-04 11:07:29'),
(4, 3, 'What 2+2', '2026-06-10 11:28:29', '2026-06-10 11:28:29'),
(9, 3, 'Please explain this to me', '2026-06-18 11:35:47', '2026-06-18 11:35:47'),
(10, 3, 'Hi', '2026-06-28 12:49:19', '2026-06-28 12:49:19');

-- --------------------------------------------------------

--
-- Table structure for table `ai_messages`
--

CREATE TABLE `ai_messages` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ai_conversation_id` bigint(20) UNSIGNED NOT NULL,
  `sender` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ai_messages`
--

INSERT INTO `ai_messages` (`id`, `ai_conversation_id`, `sender`, `content`, `created_at`, `updated_at`) VALUES
(5, 2, 'user', 'Please explain this to me', '2026-06-04 09:50:31', '2026-06-04 09:50:31'),
(6, 2, 'ai', 'Absolutely! I\'m ready to help you understand any topic.\n\nTo give you the best explanation, please tell me:\n\n*   **What specific concept, term, or problem are you trying to understand?**\n*   **Which course or subject is it related to?** (e.g., Computer Science, Economics, History, Biochemistry)\n*   **What have you tried so far, or what parts are confusing you?**\n\nFor example, you could ask me to explain:\n*   \"The concept of **opportunity cost** in Economics.\"\n*   \"How to write a strong **thesis statement** for an essay.\"\n*   \"The difference between **qualitative and quantitative research** methods.\"\n*   \"What is **blockchain technology**?\"\n\nOnce you provide more details, I\'ll break it down clearly and concisely for you!', '2026-06-04 09:50:43', '2026-06-04 09:50:43'),
(7, 3, 'user', 'Please analyse this image and explain it to me', '2026-06-04 11:07:29', '2026-06-04 11:07:29'),
(8, 3, 'ai', 'This image is a screenshot of a mobile application for **Smartcash Payment Service Bank**, which is a type of financial institution that often provides digital banking services, especially for underserved populations. Let\'s break down the different parts of the interface:\n\n1.  **Top Bar (System Information):**\n    *   **11:30 AM:** Current time.\n    *   **4G, Signal Strength, 689 B/S:** Indicates network type (4G), signal strength, and possibly data speed.\n    *   **86%:** Battery level of the device.\n    *   **Bell Icon (with 12):** This is a notification icon, indicating there are 12 unread notifications for the user within the app.\n\n2.  **Account Overview Section:**\n    *   **Smartcash Payment Service Bank:** The name of the financial service provider.\n    *   **USMAN, 708 [partially hidden number]:** This displays the account holder\'s name (Usman) and a partial account number or identifier. The green highlight suggests the user might have obscured part of their personal information for privacy.\n    *   **My QR:** This button likely allows the user to generate or view their personal QR code for quick and easy payments or receiving money without needing to type in account details.\n    *   **Account Balance: ₦180,007.70:** This shows the current amount of money available in Usman\'s Smartcash account. The \"₦\" symbol represents the Nigerian Naira, the official currency of Nigeria.\n    *   **Add Money:** This button is used to deposit funds into the Smartcash account, typically from another bank account, debit card, or agent.\n    *   **Withdraw Cash:** This button allows the user to initiate a cash withdrawal, possibly through an agent, ATM, or other designated channels.\n\n3.  **Promotional and Incentive Sections:**\n    *   **Invite a friend to Smartcash - Earn upto ₦500 per referral:** This is a **referral program**. It incentivizes existing users (like Usman) to invite new users to join Smartcash. For every successful referral (e.g., a friend signs up and performs a transaction), Usman could earn ₦500. This is a common marketing strategy to grow a user base.\n    *   **GET upto 10% CASHBACK on Airtime Recharge, Data Bundle & Bill Payments:** This is a **cashback offer**. When Usman performs specific transactions through the app, such as buying airtime, data bundles, or paying bills, they can get back up to 10% of the transaction amount. This encourages users to use the app for their daily financial needs and saves them money.\n\n4.  **Transfer & Cashout Section (Core Services):**\n    *   **Transfer Money:** This allows Usman to send money from their Smartcash account to other Smartcash accounts or possibly other bank accounts.\n    *   **Fund Smart Saver - Earn 15% Interest:** This is a **savings feature**. It encourages users to save money by offering a significant interest rate (15%). This means that if Usman puts money into the \"Smart Saver\" account, it will grow over time due to the interest earned, providing a return on their savings.\n    *   **Withdraw Cash:** Another button for cash withdrawal, likely providing different options or a direct route compared to the one above.\n    *   **More Services:** This indicates that the app offers additional functionalities beyond those explicitly listed on the main screen, which users can explore by clicking here.\n\nIn summary, this image displays a user-friendly mobile banking interface that offers essential financial services (deposits, withdrawals, transfers), attractive incentives (referral bonuses, cashback), and a high-yield savings option, all designed to make banking convenient and rewarding for the user.', '2026-06-04 11:07:59', '2026-06-04 11:07:59'),
(9, 4, 'user', 'What 2+2', '2026-06-10 11:28:29', '2026-06-10 11:28:29'),
(10, 4, 'ai', '2 + 2 = 4.\n\nThis is a basic arithmetic operation, specifically addition.', '2026-06-10 11:28:36', '2026-06-10 11:28:36'),
(27, 9, 'user', 'Please explain this to me', '2026-06-18 11:35:47', '2026-06-18 11:35:47'),
(28, 9, 'ai', 'Hello! I\'m your AI Study Assistant. How can I help you today?', '2026-06-18 11:35:58', '2026-06-18 11:35:58'),
(29, 9, 'user', 'Please explain this tto me', '2026-06-18 11:36:26', '2026-06-18 11:36:26'),
(30, 9, 'ai', 'Hello! I\'m your AI Study Assistant. How can I help you today?', '2026-06-18 11:36:43', '2026-06-18 11:36:43'),
(31, 10, 'user', 'Hi', '2026-06-28 12:49:19', '2026-06-28 12:49:19'),
(32, 10, 'ai', 'Hello! I\'m your AI Study Assistant. How can I help you today?', '2026-06-28 12:49:26', '2026-06-28 12:49:26'),
(33, 10, 'user', 'What is computer', '2026-06-28 12:49:48', '2026-06-28 12:49:48'),
(34, 10, 'ai', 'I\'m here to help you learn! To give you the best assistance, please be specific about your question. Note: The AI service is currently experiencing connection issues.', '2026-06-28 12:49:51', '2026-06-28 12:49:51');

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
(1, 'First Semester Registration Deadline', 'All students are advised to complete their course registration by the end of this month.', 'academic', 'students', 'high', 1, '2026-05-30 16:28:30', '2026-06-30 16:28:30', NULL, 1, 1, '2026-05-30 16:28:30', '2026-05-30 16:28:30'),
(2, 'New Library Resources Available', 'We have added new digital textbooks for Computer Science students.', 'general', 'all', 'low', 1, '2026-05-30 16:28:30', NULL, NULL, 1, 1, '2026-05-30 16:28:30', '2026-05-30 16:28:30'),
(3, 'First Semester Registration Deadline', 'All students are advised to complete their course registration by the end of this month.', 'academic', 'students', 'high', 1, '2026-06-04 10:43:33', '2026-07-04 10:43:33', NULL, 1, 1, '2026-06-04 10:43:33', '2026-06-04 10:43:33'),
(4, 'New Library Resources Available', 'We have added new digital textbooks for Computer Science students.', 'general', 'all', 'low', 1, '2026-06-04 10:43:33', NULL, NULL, 1, 1, '2026-06-04 10:43:33', '2026-06-04 10:43:33');

-- --------------------------------------------------------

--
-- Table structure for table `app_developers`
--

CREATE TABLE `app_developers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `position` varchar(255) NOT NULL,
  `donation` text DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `github` varchar(255) DEFAULT NULL,
  `linkedin` varchar(255) DEFAULT NULL,
  `twitter` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`id`, `course_id`, `lecturer_id`, `title`, `description`, `instructions`, `attachment_path`, `due_date`, `max_score`, `allow_late_submission`, `late_penalty_percent`, `is_published`, `created_at`, `updated_at`) VALUES
(1, 3, 2, 'Assignment testing', 'What is computer', NULL, NULL, '2026-05-31 23:00:00', 100, 1, 0, 1, '2026-05-31 22:28:20', '2026-05-31 22:28:20'),
(2, 4, 2, 'Introduction', 'What is HTML', NULL, NULL, '2026-06-01 23:00:00', 100, 1, 0, 1, '2026-05-31 22:31:52', '2026-05-31 22:31:52'),
(3, 3, 2, 'Testin', 'Yessuehe', NULL, NULL, '2026-06-01 23:00:00', 100, 1, 0, 1, '2026-05-31 22:33:18', '2026-05-31 22:33:18');

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

--
-- Dumping data for table `assignment_submissions`
--

INSERT INTO `assignment_submissions` (`id`, `assignment_id`, `student_id`, `submission_text`, `file_path`, `file_name`, `file_size`, `submitted_at`, `is_late`, `score`, `feedback`, `graded_by`, `graded_at`, `status`, `created_at`, `updated_at`) VALUES
(1, 3, 3, 'This is the my assignment', 'submissions/5100dd27-a777-4ab8-ab9f-4d3efaddf6ee.PDF', 'Payment%20Receipt%20-%20TXN-1PYFVQB1WD(2).PDF', 123532, '2026-06-01 00:27:19', 0, 100, 'Continue', 2, '2026-05-31 23:27:19', 'graded', '2026-05-31 22:53:33', '2026-05-31 23:27:19');

-- --------------------------------------------------------

--
-- Table structure for table `associations`
--

CREATE TABLE `associations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `acronym` varchar(255) DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `president_id` bigint(20) UNSIGNED DEFAULT NULL,
  `description` text DEFAULT NULL,
  `meeting_schedule` varchar(255) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `cover_image_url` varchar(255) DEFAULT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'club',
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `associations`
--

INSERT INTO `associations` (`id`, `name`, `acronym`, `category`, `president_id`, `description`, `meeting_schedule`, `logo`, `logo_url`, `banner`, `cover_image_url`, `type`, `status`, `created_at`, `updated_at`) VALUES
(2, 'Test test test', 'TTT', 'Academic', 3, 'Test t at t at test test test', 'Not Scheduled Yet', NULL, NULL, NULL, NULL, 'club', 'active', '2026-05-31 18:35:03', '2026-05-31 18:35:03'),
(3, 'National Association of Computer Science Students (NACOSS)', NULL, NULL, NULL, 'The umbrella body for all computing students.', NULL, NULL, NULL, NULL, NULL, 'academic', 'active', '2026-06-04 10:43:33', '2026-06-04 10:43:33');

-- --------------------------------------------------------

--
-- Table structure for table `association_documents`
--

CREATE TABLE `association_documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `association_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_type` varchar(255) NOT NULL DEFAULT 'PDF',
  `uploaded_by` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `association_documents`
--

INSERT INTO `association_documents` (`id`, `association_id`, `title`, `file_path`, `file_type`, `uploaded_by`, `created_at`, `updated_at`) VALUES
(1, 2, 'Institution', 'https://drive.google.com/file/d/11XWi4wYSWhyfc9Gu0yO6BPJOQ2HDtGh6/view?usp=drivesdk', 'PDF', 3, '2026-05-31 19:18:45', '2026-05-31 19:18:45');

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
  `updated_at` timestamp NULL DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `association_members`
--

INSERT INTO `association_members` (`id`, `association_id`, `user_id`, `role`, `joined_at`, `created_at`, `updated_at`, `status`) VALUES
(1, 2, 3, 'president', '2026-05-31 18:35:03', '2026-05-31 18:35:03', '2026-05-31 18:35:03', 'approved'),
(2, 2, 1, 'member', '2026-05-31 19:20:02', '2026-05-31 19:10:10', '2026-05-31 19:20:02', 'approved');

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
  `status` varchar(255) DEFAULT 'present',
  `is_hand_raised` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendances`
--

INSERT INTO `attendances` (`id`, `virtual_class_id`, `user_id`, `joined_at`, `left_at`, `created_at`, `updated_at`, `status`, `is_hand_raised`) VALUES
(1, 2, 3, '2026-05-31 21:02:50', NULL, '2026-05-31 20:02:50', '2026-05-31 20:03:01', 'present', 0),
(2, 3, 3, '2026-05-31 22:36:02', NULL, '2026-05-31 21:36:02', '2026-05-31 21:36:02', 'present', 0),
(3, 4, 3, '2026-05-31 23:19:59', NULL, '2026-05-31 22:20:00', '2026-05-31 22:20:00', 'present', 0),
(4, 5, 3, '2026-06-04 12:05:33', NULL, '2026-06-04 11:05:33', '2026-06-04 11:05:33', 'present', 0);

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

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `model_type`, `model_id`, `old_values`, `new_values`, `ip_address`, `user_agent`, `metadata`, `created_at`, `updated_at`) VALUES
(1, 1, 'Update System Setting', 'SystemSettings', 0, '{\"hostel_service_fee\":null}', '{\"hostel_service_fee\":25000}', '192.168.183.136', 'okhttp/4.12.0', NULL, '2026-05-31 18:25:32', '2026-05-31 18:25:32'),
(2, 1, 'Admin Updated Product Status', 'App\\Models\\Product', 6, '{\"status\":\"active\"}', '{\"status\":\"suspended\"}', '192.168.137.106', 'okhttp/4.12.0', NULL, '2026-06-04 07:22:27', '2026-06-04 07:22:27'),
(3, 1, 'Admin Updated Product Status', 'App\\Models\\Product', 10, '{\"status\":\"active\"}', '{\"status\":\"suspended\"}', '192.168.137.106', 'okhttp/4.12.0', NULL, '2026-06-04 07:22:33', '2026-06-04 07:22:33'),
(4, 1, 'Admin Deleted Product', 'App\\Models\\Product', 6, '{\"name\":\"USB-C Charging Cable (2 Meters)\"}', '{\"deleted\":true}', '192.168.58.23', 'okhttp/4.12.0', NULL, '2026-06-04 08:55:06', '2026-06-04 08:55:06');

-- --------------------------------------------------------

--
-- Table structure for table `blog_posts`
--

CREATE TABLE `blog_posts` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `summary` text DEFAULT NULL,
  `content` longtext NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `video_path` varchar(255) DEFAULT NULL,
  `author_name` varchar(255) NOT NULL DEFAULT 'Admin',
  `status` varchar(255) NOT NULL DEFAULT 'draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `views` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `blog_posts`
--

INSERT INTO `blog_posts` (`id`, `title`, `slug`, `summary`, `content`, `image_path`, `video_path`, `author_name`, `status`, `published_at`, `views`, `created_at`, `updated_at`) VALUES
(1, 'Getting Started with KIU Explorer: A Comprehensive Guide', 'getting-started-with-kiu-explorer-comprehensive-guide', 'Discover how to install, register, and leverage the ultimate campus companion app for Kashim Ibrahim University.', '## Introduction\r\nWelcome to Kashim Ibrahim University! Navigating campus life can be challenging, but with the new **KIU Explorer** app, everything is now in the palm of your hands.\r\n\r\nIn this guide, we will walk you through the key features of the app and how you can get started today.\r\n\r\n## 1. Downloading and Installing the APK\r\nFirst, download the APK package directly from this landing page. Since this is an Android application distributed outside of the Google Play Store, you will need to allow installation from *Unknown Sources* in your device security settings.\r\n\r\n## 2. Setting Up Your Account\r\nOpen the app and select your role (Student or Lecturer). You can register with your university details. Ensure that you use a valid email address as verification may be required.\r\n\r\n## 3. Top Features You Should Explore\r\n- **Interactive Campus Navigation:** Search for specific classrooms, lecture halls, or administrative offices and get step-by-step directions.\r\n- **Academic Planner:** Input your course codes, track assignments, and automatically compute your GPA.\r\n- **Hostel Hub:** Search for hostels, pay fees securely via Paystack, and get your bed allocated dynamically.\r\n\r\n## Conclusion\r\nKIU Explorer is designed to make your academic journey smooth and connected. Start exploring now, and stay tuned for more feature updates!', 'blog/b9zGg246Ntg5OgFBU74LX6vAYSrtrkskUatj2Aqo.png', NULL, 'KIU Explorer Team', 'published', '2026-06-26 15:47:12', 126, '2026-06-28 15:47:12', '2026-06-28 16:33:18');

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-server_start_time', 'O:25:\"Illuminate\\Support\\Carbon\":3:{s:4:\"date\";s:26:\"2026-06-18 12:38:01.451235\";s:13:\"timezone_type\";i:3;s:8:\"timezone\";s:3:\"UTC\";}', 1781872681);

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

--
-- Dumping data for table `campus_locations`
--

INSERT INTO `campus_locations` (`id`, `name`, `type`, `description`, `latitude`, `longitude`, `image_url`, `contact_phone`, `contact_email`, `operating_hours`, `is_active`, `floor_number`, `building_code`, `created_at`, `updated_at`) VALUES
(7, 'Senate Building', 'building', 'Senate Building', 11.84338600, 13.00152700, NULL, NULL, NULL, '08:00 AM - 05:00 PM', 1, 0, 'Senate Building', '2026-06-18 11:41:41', '2026-06-18 11:41:41');

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

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id`, `post_id`, `user_id`, `content`, `created_at`, `updated_at`) VALUES
(1, 3, 5, 'Hi', '2026-05-31 10:45:42', '2026-05-31 10:45:42'),
(2, 3, 3, 'Hi', '2026-05-31 10:47:25', '2026-05-31 10:47:25'),
(3, 4, 3, 'Hi', '2026-05-31 19:19:37', '2026-05-31 19:19:37');

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

--
-- Dumping data for table `conversations`
--

INSERT INTO `conversations` (`id`, `name`, `type`, `last_message_at`, `created_at`, `updated_at`, `group_id`) VALUES
(1, NULL, 'private', '2026-05-31 09:30:29', '2026-05-31 09:30:13', '2026-05-31 09:30:29', NULL),
(2, NULL, 'private', '2026-06-18 13:41:24', '2026-05-31 11:05:46', '2026-06-18 13:41:24', NULL);

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

--
-- Dumping data for table `conversation_participants`
--

INSERT INTO `conversation_participants` (`id`, `conversation_id`, `user_id`, `last_read_at`, `created_at`, `updated_at`) VALUES
(1, 1, 3, '2026-06-10 11:29:43', '2026-05-31 09:30:13', '2026-06-10 11:29:43'),
(2, 1, 2, NULL, '2026-05-31 09:30:13', '2026-05-31 09:30:13'),
(3, 2, 3, '2026-06-18 13:41:17', '2026-05-31 11:05:46', '2026-06-18 13:41:17'),
(4, 2, 5, '2026-05-31 11:07:14', '2026-05-31 11:05:46', '2026-05-31 11:07:14');

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
(3, 32, 'Edu 101', 'Introduction', 2, '100', 'First', 'Introduction to teaching', 0, '2026-05-31 09:26:07', '2026-05-31 09:26:07'),
(4, 39, 'CSC205', 'Introduction to Backend', 3, '200', 'First', NULL, 0, '2026-05-31 16:00:44', '2026-05-31 16:00:44'),
(5, 1, 'CSC 301', 'Database Management Systems', 3, '300', 'First', NULL, 0, '2026-06-04 10:43:32', '2026-06-04 10:43:32'),
(6, 1, 'CSC 305', 'Operating Systems I', 3, '300', 'First', NULL, 0, '2026-06-04 10:43:33', '2026-06-04 10:43:33');

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

--
-- Dumping data for table `course_allocations`
--

INSERT INTO `course_allocations` (`id`, `user_id`, `course_id`, `academic_session_id`, `is_coordinator`, `created_at`, `updated_at`) VALUES
(1, 6, 4, 1, 1, '2026-05-31 16:00:44', '2026-05-31 17:07:29');

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
(1, 1, 'Medicine and Surgery', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(2, 1, 'Nursing Science', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(3, 1, 'Physiotherapy', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(4, 1, 'Radiography', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(5, 1, 'Medical Laboratory Science', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(6, 1, 'Health Information Management', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(7, 2, 'Agriculture', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(8, 3, 'Animal and Environmental Biology', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(9, 3, 'Biotechnology', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(10, 3, 'Plant Science and Biotechnology', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(11, 3, 'Computer Science', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(12, 3, 'Mathematics', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(13, 3, 'Statistics', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(14, 3, 'Chemistry', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(15, 3, 'Physics', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(16, 3, 'Biochemistry', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(17, 4, 'Accounting', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(18, 4, 'Business Administration', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(19, 4, 'Economics', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(20, 4, 'Criminology and Security Studies', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(21, 4, 'Geography', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(22, 4, 'Mass Communication', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(23, 4, 'Public Administration', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(24, 4, 'Political Science', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(25, 4, 'Peace Studies and Conflict Resolution', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(26, 4, 'Sociology', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(27, 5, 'Education English', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(28, 5, 'Education Islamic Studies', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(29, 5, 'Education Economics', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(30, 5, 'Education Mathematics', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(31, 5, 'Education Physics', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(32, 5, 'Education Computer Science', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(33, 5, 'Education Chemistry', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(34, 5, 'Education Biology', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(35, 5, 'English Language', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(36, 5, 'Literature in English', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(37, 5, 'Islamic Studies', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30');

-- --------------------------------------------------------

--
-- Table structure for table `download_logs`
--

CREATE TABLE `download_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `download_logs`
--

INSERT INTO `download_logs` (`id`, `ip_address`, `created_at`) VALUES
(1, '::1', '2026-06-28 13:53:10'),
(2, '::1', '2026-06-28 16:37:43');

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
  `category` varchar(255) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'upcoming',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `event_date` date DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`id`, `association_id`, `created_by`, `title`, `description`, `venue`, `category`, `start_time`, `end_time`, `capacity`, `banner`, `image_url`, `status`, `created_at`, `updated_at`, `event_date`, `type`) VALUES
(1, NULL, 3, 'Test', 'Tes', 'Block 1', 'Social', '2026-05-30 16:45:00', '2026-06-03 18:45:00', NULL, NULL, NULL, 'upcoming', '2026-05-30 15:45:46', '2026-05-30 15:45:46', NULL, NULL),
(2, NULL, 1, 'University Cultural Week', 'A week-long celebration of diversity and culture at KIU.', 'Main Convocation Square', 'Social', '2026-06-06 17:28:30', NULL, 500, NULL, NULL, 'upcoming', '2026-05-30 16:28:30', '2026-05-30 16:28:30', NULL, NULL),
(3, NULL, 3, 'Testing', 'Test', 'Block 1', 'Workshop', '2026-05-31 11:41:22', '2026-05-31 13:41:22', NULL, NULL, NULL, 'upcoming', '2026-05-31 10:41:30', '2026-05-31 10:41:30', NULL, NULL),
(4, NULL, 1, 'University Cultural Week', 'A week-long celebration of diversity and culture at KIU.', 'Main Convocation Square', 'Social', '2026-06-11 11:43:33', NULL, 500, NULL, NULL, 'upcoming', '2026-06-04 10:43:33', '2026-06-04 10:43:33', NULL, NULL);

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

--
-- Dumping data for table `event_registrations`
--

INSERT INTO `event_registrations` (`id`, `event_id`, `user_id`, `registered_at`, `created_at`, `updated_at`) VALUES
(2, 1, 3, '2026-05-31 10:29:20', '2026-05-31 09:29:20', '2026-05-31 09:29:20');

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
(1, 'Faculty of Basic Medical and Allied Health Science', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(2, 'Faculty of Agriculture', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(3, 'Faculty of Science', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(4, 'Faculty of Social & Management Sciences', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(5, 'Faculty of Art and Education', NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30');

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

--
-- Dumping data for table `friendships`
--

INSERT INTO `friendships` (`id`, `user_id`, `friend_id`, `created_at`, `updated_at`) VALUES
(1, 5, 3, '2026-05-31 11:05:45', '2026-05-31 11:05:45'),
(2, 3, 5, '2026-05-31 11:05:45', '2026-05-31 11:05:45');

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

--
-- Dumping data for table `friend_requests`
--

INSERT INTO `friend_requests` (`id`, `sender_id`, `receiver_id`, `status`, `created_at`, `updated_at`) VALUES
(1, 5, 3, 'accepted', '2026-05-31 10:44:56', '2026-05-31 11:05:45');

-- --------------------------------------------------------

--
-- Table structure for table `gallery_items`
--

CREATE TABLE `gallery_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `media_path` varchar(255) NOT NULL,
  `thumbnail_path` varchar(255) DEFAULT NULL,
  `type` varchar(255) NOT NULL DEFAULT 'image',
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gallery_items`
--

INSERT INTO `gallery_items` (`id`, `title`, `media_path`, `thumbnail_path`, `type`, `description`, `created_at`, `updated_at`) VALUES
(10, 'test', 'gallery/images/E3SEAlzfSH9yWax7ID2En1styBkwAIrXmIW1ze4O.png', NULL, 'image', 'testfv', '2026-06-28 16:17:25', '2026-06-28 16:17:25'),
(11, 'test', 'gallery/videos/BbZxLmIU8uRxmfOhX1P46gwoaEG2s9pTtVDM6hEq.mp4', NULL, 'video', 'test', '2026-06-28 16:18:46', '2026-06-28 16:18:46');

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
-- Table structure for table `gpa_entries`
--

CREATE TABLE `gpa_entries` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `semester` varchar(255) NOT NULL,
  `course_code` varchar(255) NOT NULL,
  `course_title` varchar(255) DEFAULT NULL,
  `credit_units` int(11) NOT NULL,
  `grade` varchar(255) NOT NULL,
  `grade_points` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `gpa_entries`
--

INSERT INTO `gpa_entries` (`id`, `user_id`, `semester`, `course_code`, `course_title`, `credit_units`, `grade`, `grade_points`, `created_at`, `updated_at`) VALUES
(2, 3, 'Year 1 Sem 1', 'MTH 101', NULL, 3, 'A', 5, '2026-06-18 13:35:55', '2026-06-18 13:37:45'),
(3, 3, 'Year 1 Sem 1', 'MTH 102', 'Math', 3, 'A', 5, '2026-06-18 13:36:24', '2026-06-18 13:37:51');

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
-- Table structure for table `hostel_attendance`
--

CREATE TABLE `hostel_attendance` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `hostel_id` bigint(20) UNSIGNED NOT NULL,
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `direction` enum('in','out') NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `device_id` varchar(255) DEFAULT NULL,
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
  `hostel_id` bigint(20) UNSIGNED DEFAULT NULL,
  `hostel_room_id` bigint(20) UNSIGNED DEFAULT NULL,
  `room_number` varchar(255) DEFAULT NULL,
  `category` enum('plumbing','electrical','carpentry','cleaning','security','water_supply','other') DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` enum('pending','assigned','in_progress','resolved','closed') DEFAULT 'pending',
  `admin_comment` text DEFAULT NULL,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hostel_complaints`
--

INSERT INTO `hostel_complaints` (`id`, `student_id`, `hostel_id`, `hostel_room_id`, `room_number`, `category`, `title`, `description`, `status`, `admin_comment`, `resolved_at`, `created_at`, `updated_at`) VALUES
(2, 3, NULL, NULL, 'Room 3', 'other', 'Hello guys 🤠', 'What is going on here!', 'pending', NULL, NULL, '2026-06-08 13:05:03', '2026-06-08 13:05:03');

-- --------------------------------------------------------

--
-- Table structure for table `hostel_heads`
--

CREATE TABLE `hostel_heads` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `hostel_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL DEFAULT 'Head of Hostel',
  `phone` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `room_number` varchar(255) DEFAULT NULL,
  `office_hours` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hostel_leaves`
--

CREATE TABLE `hostel_leaves` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `hostel_id` bigint(20) UNSIGNED NOT NULL,
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text NOT NULL,
  `status` enum('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approver_comments` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hostel_roommate_profiles`
--

CREATE TABLE `hostel_roommate_profiles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `sleep_habit` varchar(255) DEFAULT NULL,
  `study_habit` varchar(255) DEFAULT NULL,
  `cleanliness` varchar(255) DEFAULT NULL,
  `social_habit` varchar(255) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `interests` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `hostel_roommate_profiles`
--

INSERT INTO `hostel_roommate_profiles` (`id`, `student_id`, `sleep_habit`, `study_habit`, `cleanliness`, `social_habit`, `bio`, `interests`, `created_at`, `updated_at`) VALUES
(1, 3, 'early_bird', 'quiet', 'neat_freak', 'introvert', 'A', NULL, '2026-05-31 09:37:05', '2026-05-31 17:11:36');

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
-- Table structure for table `hostel_rules`
--

CREATE TABLE `hostel_rules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `hostel_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hostel_visitors`
--

CREATE TABLE `hostel_visitors` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `hostel_id` bigint(20) UNSIGNED NOT NULL,
  `room_id` bigint(20) UNSIGNED NOT NULL,
  `visitor_name` varchar(255) NOT NULL,
  `visitor_phone` varchar(255) NOT NULL,
  `relationship` varchar(255) DEFAULT NULL,
  `purpose` text DEFAULT NULL,
  `check_in` timestamp NULL DEFAULT NULL,
  `check_out` timestamp NULL DEFAULT NULL,
  `status` enum('pre-registered','active','checked-out') NOT NULL DEFAULT 'pre-registered',
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

--
-- Dumping data for table `jobs`
--

INSERT INTO `jobs` (`id`, `queue`, `payload`, `attempts`, `reserved_at`, `available_at`, `created_at`) VALUES
(1, 'default', '{\"uuid\":\"c0a4d4af-bab2-4736-ad40-5ab4567e0e76\",\"displayName\":\"App\\\\Events\\\\SystemAlertBroadcast\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":17:{s:5:\\\"event\\\";O:31:\\\"App\\\\Events\\\\SystemAlertBroadcast\\\":1:{s:5:\\\"alert\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:22:\\\"App\\\\Models\\\\SystemAlert\\\";s:2:\\\"id\\\";i:1;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:23:\\\"deleteWhenMissingModels\\\";b:1;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1780161788,\"delay\":null}', 0, NULL, 1780161788, 1780161788),
(2, 'default', '{\"uuid\":\"cf6efd7f-c383-4b23-b2a1-ef944cf2743d\",\"displayName\":\"App\\\\Events\\\\SystemAlertBroadcast\",\"job\":\"Illuminate\\\\Queue\\\\CallQueuedHandler@call\",\"maxTries\":null,\"maxExceptions\":null,\"failOnTimeout\":false,\"backoff\":null,\"timeout\":null,\"retryUntil\":null,\"data\":{\"commandName\":\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\",\"command\":\"O:38:\\\"Illuminate\\\\Broadcasting\\\\BroadcastEvent\\\":17:{s:5:\\\"event\\\";O:31:\\\"App\\\\Events\\\\SystemAlertBroadcast\\\":1:{s:5:\\\"alert\\\";O:45:\\\"Illuminate\\\\Contracts\\\\Database\\\\ModelIdentifier\\\":5:{s:5:\\\"class\\\";s:22:\\\"App\\\\Models\\\\SystemAlert\\\";s:2:\\\"id\\\";i:2;s:9:\\\"relations\\\";a:0:{}s:10:\\\"connection\\\";s:5:\\\"mysql\\\";s:15:\\\"collectionClass\\\";N;}}s:5:\\\"tries\\\";N;s:7:\\\"timeout\\\";N;s:7:\\\"backoff\\\";N;s:13:\\\"maxExceptions\\\";N;s:23:\\\"deleteWhenMissingModels\\\";b:1;s:10:\\\"connection\\\";N;s:5:\\\"queue\\\";N;s:12:\\\"messageGroup\\\";N;s:12:\\\"deduplicator\\\";N;s:5:\\\"delay\\\";N;s:11:\\\"afterCommit\\\";N;s:10:\\\"middleware\\\";a:0:{}s:7:\\\"chained\\\";a:0:{}s:15:\\\"chainConnection\\\";N;s:10:\\\"chainQueue\\\";N;s:19:\\\"chainCatchCallbacks\\\";N;}\"},\"createdAt\":1780162742,\"delay\":null}', 0, NULL, 1780162742, 1780162742);

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
-- Table structure for table `landing_page_settings`
--

CREATE TABLE `landing_page_settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `app_name` varchar(255) NOT NULL DEFAULT 'KIU Explorer',
  `hero_title` varchar(255) NOT NULL,
  `hero_subtitle` text NOT NULL,
  `apk_version` varchar(255) NOT NULL DEFAULT '1.0.0',
  `apk_size` varchar(255) NOT NULL DEFAULT '18.5 MB',
  `apk_file_path` varchar(255) DEFAULT NULL,
  `download_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `primary_color` varchar(255) NOT NULL DEFAULT '#09a5db',
  `secondary_color` varchar(255) NOT NULL DEFAULT '#0f172a',
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `faqs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`faqs`)),
  `screenshots` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`screenshots`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `hero_image_path` varchar(255) DEFAULT NULL,
  `hero_video_path` varchar(255) DEFAULT NULL,
  `theme_mode` varchar(255) NOT NULL DEFAULT 'dark',
  `show_features` tinyint(1) NOT NULL DEFAULT 1,
  `show_faqs` tinyint(1) NOT NULL DEFAULT 1,
  `show_stats` tinyint(1) NOT NULL DEFAULT 1,
  `custom_sections` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`custom_sections`)),
  `show_team` tinyint(1) NOT NULL DEFAULT 1,
  `team` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`team`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `landing_page_settings`
--

INSERT INTO `landing_page_settings` (`id`, `app_name`, `hero_title`, `hero_subtitle`, `apk_version`, `apk_size`, `apk_file_path`, `download_count`, `primary_color`, `secondary_color`, `features`, `faqs`, `screenshots`, `created_at`, `updated_at`, `hero_image_path`, `hero_video_path`, `theme_mode`, `show_features`, `show_faqs`, `show_stats`, `custom_sections`, `show_team`, `team`) VALUES
(1, 'KIU', 'Navigate, Plan, and Connect at KIU', 'The ultimate digital campus companion for Kashim Ibrahim University. Find classrooms, book hostels, calculate GPA, chat with peers, and stay updated with campus announcements—all in one place.', '1.0.41', '22.4 MB', NULL, 145, '#09a5db', '#0f172a', '[{\"title\":\"Interactive Map Navigation\",\"description\":\"Find classrooms, lecture halls, administrative offices, and hostels with step-by-step campus guidance.\",\"icon\":\"map\"},{\"title\":\"Academic Planner - GPA\",\"description\":\"Track your assignments, calculate your GPA automatically, and view class timetables in a gorgeous scheduler.\",\"icon\":\"book\"},{\"title\":\"Hostel Accommodation Hub\",\"description\":\"Browse available hostels, secure bed allocations, pay fees via Paystack, and find roommates.\",\"icon\":\"home\"},{\"title\":\"Campus Forums  - Socials\",\"description\":\"Join student associations, chat in real-time, buy\\/sell on the marketplace, and search for lost items.\",\"icon\":\"chat\"}]', '[{\"question\":\"How do I install the KIU Explorer APK?\",\"answer\":\"Download the APK file by clicking the download button on this page. Locate the downloaded file in your file manager and tap it. If prompted, enable &amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;quot;Install from Unknown Sources&amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;amp;quot; in your device settings to complete installation.\"},{\"question\":\"What are the system requirements?\",\"answer\":\"KIU Explorer is optimized for Android devices running Android 8.0 (Oreo) and above. An active internet connection is recommended for real-time synchronization.\"},{\"question\":\"How do I log into the app?\",\"answer\":\"Use your registered university student or lecturer credentials. If you do not have an account, you can easily register directly within the app.\"}]', '[]', '2026-06-28 13:18:24', '2026-06-28 16:37:43', 'images/hero-mockup-1782665060.png', NULL, 'dark', 1, 1, 1, '[]', 1, '[{\"name\":\"Umar Alhaji Husseini\",\"role\":\"Team Lead KIU EXPLORER\",\"description\":\"testing\",\"phone\":\"+2347040084401\",\"email\":\"umaralhajihussaini@gmail.com\",\"photo_path\":\"team\\/0T1MNSZUUaxqnAKSUa5OXyM73sT79biTL2Qn9P7t.png\",\"socials\":{\"facebook\":\"\",\"linkedin\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"x\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"github\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"instagram\":\"\",\"portfolio\":\"\"},\"custom_links\":[]},{\"name\":\"Abdulazez Abdullahi\",\"role\":\"rrr\",\"description\":\"\",\"phone\":\"\",\"email\":\"abdulazezabdulahi0320@gmail.com\",\"photo_path\":\"team\\/foQdrvx9gJvA4yDblErqKTTvxK9bwxNLVBOnlDk9.png\",\"socials\":{\"facebook\":\"\",\"linkedin\":\"\",\"x\":\"\",\"github\":\"\",\"instagram\":\"\",\"portfolio\":\"\"},\"custom_links\":[]},{\"name\":\"Umar Alhaji Hussaini\",\"role\":\"testu\",\"description\":\"testing\",\"phone\":\"\",\"email\":\"umaralhajihussaini@gmail.com\",\"photo_path\":\"team\\/POPsbNlL30gw2MOflQHYMeBk2Ssb54TaYjHzqs2v.png\",\"socials\":{\"facebook\":\"\",\"linkedin\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"x\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"github\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"instagram\":\"\",\"portfolio\":\"\"},\"custom_links\":[]},{\"name\":\"geee\",\"role\":\"eee\",\"description\":\"eee\",\"phone\":\"+2347040084401\",\"email\":\"umaralhajihussaaini@gmail.com\",\"photo_path\":null,\"socials\":{\"facebook\":\"\",\"linkedin\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"x\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"github\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"instagram\":\"\",\"portfolio\":\"\"},\"custom_links\":[]},{\"name\":\"te\",\"role\":\"eee\",\"description\":\"eeee\",\"phone\":\"574208653210\",\"email\":\"umaralhajihusassaini@gmail.com\",\"photo_path\":\"team\\/Oa9HJauJKqGPsK8jWuQ4myKejgr3kW5mNtjij6Rh.png\",\"socials\":{\"facebook\":\"\",\"linkedin\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"x\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"github\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"instagram\":\"\",\"portfolio\":\"\"},\"custom_links\":[]},{\"name\":\"Umar Alhaji Hussaini\",\"role\":\"sss\",\"description\":\"ssss\",\"phone\":\"+23470400844013\",\"email\":\"umaralhaaaaaaaaaaaajihussaini@gmail.com\",\"photo_path\":\"team\\/fg6sRO1AfciU2tPphuFLYdeSkxpjiFCcJtBzsxGs.png\",\"socials\":{\"facebook\":\"\",\"linkedin\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"x\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"github\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"instagram\":\"\",\"portfolio\":\"\"},\"custom_links\":[]},{\"name\":\"Abdulazez Abdullahi\",\"role\":\"test\",\"description\":\"test\",\"phone\":\"+2347040084401234\",\"email\":\"abdulazasdfezabdulahi0320@gmail.com\",\"photo_path\":\"team\\/53UpVubfFrauJvCWqO8M7APvf2fNEvl2voTAyPz4.png\",\"socials\":{\"facebook\":\"\",\"linkedin\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"x\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"github\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"instagram\":\"\",\"portfolio\":\"\"},\"custom_links\":[]},{\"name\":\"Bashir Alhassan\",\"role\":\"test\",\"description\":\"test\",\"phone\":\"+234704008440123432\",\"email\":\"umaralhajihufgbhssaini@gmail.com\",\"photo_path\":\"team\\/fvMYYSjJyBfFTZWPntrjK523eRyF02DY4GF3TIKP.png\",\"socials\":{\"facebook\":\"\",\"linkedin\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"x\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"github\":\"http:\\/\\/localhost\\/app\\/KIU%20EXPLORER\\/backend\\/public\\/cms\\/dashboard\",\"instagram\":\"\",\"portfolio\":\"\"},\"custom_links\":[]}]');

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
(1, 6, 39, 'STF-1726', 'PhD', NULL, NULL, NULL, '2026-05-31 16:00:44', '2026-05-31 17:07:29');

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
(1, 'Mastering Laravel 11', 'Taylor Otwell', 'textbook', 'Modern web development with PHP.', 'library/sample.pdf', 'PDF', 1024000, NULL, NULL, NULL, 1, 0, 1, 1, 1, '2026-05-30 16:28:30', '2026-05-30 16:28:30', '2026-05-30 16:28:30'),
(2, 'Introduction', NULL, 'reference', 'Introduction', 'library/2240389a-9afe-4861-a60b-cb0524316f90.pdf', 'pdf', 190867, NULL, NULL, 'Csc', 2, 4, 1, 1, NULL, NULL, '2026-05-31 09:48:47', '2026-06-18 13:28:45'),
(3, 'Mastering Laravel 11', 'Taylor Otwell', 'textbook', 'Modern web development with PHP.', 'library/sample.pdf', 'PDF', 1024000, NULL, NULL, NULL, 1, 0, 1, 1, 1, '2026-06-04 10:43:33', '2026-06-04 10:43:33', '2026-06-04 10:43:33');

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

--
-- Dumping data for table `likes`
--

INSERT INTO `likes` (`id`, `post_id`, `user_id`, `created_at`, `updated_at`) VALUES
(1, 4, 3, '2026-05-31 19:19:43', '2026-05-31 19:19:43');

-- --------------------------------------------------------

--
-- Table structure for table `lost_items`
--

CREATE TABLE `lost_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `location` varchar(255) NOT NULL,
  `founder` varchar(255) DEFAULT NULL,
  `contact_details` varchar(255) NOT NULL,
  `type` enum('lost','found') NOT NULL,
  `status` enum('open','resolved') NOT NULL DEFAULT 'open',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lost_items`
--

INSERT INTO `lost_items` (`id`, `user_id`, `title`, `description`, `image_url`, `location`, `founder`, `contact_details`, `type`, `status`, `created_at`, `updated_at`) VALUES
(2, 3, 'Found: Set of Keys with Toyota Fob', 'Found a set of keys with a Toyota remote key fob on the pathway leading to the Faculty of Law. Has a blue lanyard.', NULL, 'Pathway to Faculty of Law', 'Abubakar Musa', '08012345678 or pick it up at Room 14, Male Hostel A', 'found', 'open', '2026-06-04 10:45:28', '2026-06-04 10:45:28'),
(3, 3, 'Lost Brown Leather Wallet', 'Lost my brown leather wallet containing my student ID card and library card around the Main Convocation Square during the cultural week.', NULL, 'Main Convocation Square', NULL, 'Please message me here or call 08012345678', 'lost', 'resolved', '2026-06-04 10:45:28', '2026-06-04 10:45:28');

-- --------------------------------------------------------

--
-- Table structure for table `lost_item_comments`
--

CREATE TABLE `lost_item_comments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `lost_item_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `lost_item_comments`
--

INSERT INTO `lost_item_comments` (`id`, `lost_item_id`, `user_id`, `content`, `created_at`, `updated_at`) VALUES
(3, 2, 1, 'If anyone claims this key, please verify by demonstrating that it unlocks their vehicle.', '2026-06-04 10:45:28', '2026-06-04 10:45:28');

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

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`id`, `conversation_id`, `user_id`, `content`, `media_url`, `media_size`, `media_mime_type`, `media_duration`, `thumbnail_url`, `file_name`, `type`, `created_at`, `updated_at`) VALUES
(1, 1, 3, 'Hi', NULL, NULL, NULL, NULL, NULL, NULL, 'text', '2026-05-31 09:30:29', '2026-05-31 09:30:29'),
(2, 2, 3, 'Hi', NULL, NULL, NULL, NULL, NULL, NULL, 'text', '2026-05-31 11:05:59', '2026-05-31 11:05:59'),
(3, 2, 5, 'How are you', NULL, NULL, NULL, NULL, NULL, NULL, 'text', '2026-05-31 11:07:20', '2026-05-31 11:07:20'),
(4, 2, 3, 'Hi', NULL, NULL, NULL, NULL, NULL, NULL, 'text', '2026-06-18 13:41:24', '2026-06-18 13:41:24');

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
(56, '2026_01_18_000000_add_settings_to_users_table', 1),
(57, '2026_01_18_000001_create_support_tickets_table', 1),
(58, '2026_01_18_000002_create_quiz_questions_table', 1),
(59, '2026_02_08_000000_create_reports_table', 1),
(60, '2026_02_08_120000_create_academic_events_table', 1),
(61, '2026_02_08_120100_create_audit_logs_table', 1),
(62, '2026_02_08_120200_create_system_alerts_table', 1),
(63, '2026_02_08_120300_create_permissions_and_roles_tables', 1),
(64, '2026_02_08_140000_add_virtual_class_features', 1),
(65, '2026_02_08_200000_create_payments_table', 1),
(66, '2026_02_23_000000_create_hostels_table', 1),
(67, '2026_02_23_000000_fix_database_schema', 1),
(68, '2026_02_23_000001_create_hostel_rooms_table', 1),
(69, '2026_02_23_000002_create_hostel_bookings_table', 1),
(70, '2026_02_23_000003_create_hostel_complaints_table', 1),
(71, '2026_02_24_000000_add_youtube_fields_to_tutorials', 1),
(72, '2026_04_21_214915_create_hostel_beds_table', 1),
(73, '2026_04_21_221753_alter_hostel_complaints_enums', 1),
(74, '2026_05_01_171500_add_course_code_and_status_to_tutorials_table', 1),
(75, '2026_05_02_100000_make_course_id_nullable_in_tutorials_table', 1),
(76, '2026_05_02_110000_add_course_code_to_library_resources_table', 1),
(77, '2026_05_02_120000_add_course_code_to_exams_table', 1),
(78, '2026_05_02_130000_add_uploaded_by_to_exams_table', 1),
(79, '2026_05_29_add_chat_muted_to_virtual_classes_table', 1),
(80, '2026_06_01_000000_create_hostel_rules_table', 1),
(81, '2026_06_02_000000_create_hostel_attendance_table', 1),
(82, '2026_06_03_000000_create_hostel_leaves_table', 1),
(83, '2026_06_04_000000_create_hostel_visitors_table', 1),
(84, '2026_06_05_000000_create_hostel_roommate_profiles_table', 1),
(85, '2026_06_06_000000_add_visibility_to_posts_table', 1),
(86, '2026_06_07_000000_add_push_token_to_users_table', 1),
(87, '2026_06_08_000000_add_status_to_association_members_table', 2),
(88, '2026_06_09_000000_add_missing_fields_to_associations_table', 3),
(89, '2026_06_10_000000_create_association_documents_table', 4),
(90, '2026_06_11_000000_create_app_developers_table', 5),
(91, '2026_06_04_100000_update_hostel_complaints_table', 6),
(92, '2026_06_12_000000_create_shops_table', 6),
(93, '2026_06_12_000001_create_products_table', 6),
(94, '2026_06_13_000000_create_adverts_table', 7),
(95, '2026_06_14_000000_add_gallery_to_products_table', 8),
(96, '2026_06_14_000001_create_product_reviews_table', 8),
(97, '2026_06_13_000000_create_ai_conversations_table', 9),
(98, '2026_06_13_000001_create_ai_messages_table', 9),
(99, '2026_06_15_000000_create_lost_items_table', 10),
(100, '2026_06_15_000001_create_lost_item_comments_table', 10),
(101, '2026_06_04_122956_create_hostel_heads_table', 11),
(102, '2026_06_16_000000_create_gpa_entries_table', 12),
(103, '2026_06_16_000001_create_vault_documents_table', 12),
(104, '2026_06_28_000000_create_landing_page_settings_table', 13),
(105, '2026_06_28_000001_add_custom_layout_fields_to_landing_page_settings', 14),
(106, '2026_06_28_000002_create_download_logs_table', 15),
(107, '2026_06_28_000003_add_team_to_landing_page_settings', 16),
(108, '2026_06_28_000004_add_hero_video_to_landing_page_settings', 17),
(109, '2026_06_28_000005_create_blog_posts_table', 18),
(110, '2026_06_28_000006_create_gallery_items_table', 19),
(111, '2026_06_28_000007_add_video_path_to_blog_posts_table', 19),
(112, '2026_06_28_000008_add_thumbnail_path_to_gallery_items_table', 20);

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

--
-- Dumping data for table `parent_guardians`
--

INSERT INTO `parent_guardians` (`id`, `student_id`, `full_name`, `relationship`, `phone_number`, `alternative_phone`, `email`, `address`, `occupation`, `is_primary`, `created_at`, `updated_at`) VALUES
(1, 3, 'Husseini Alhaji', 'Brother', '07000778461', '07081554070', 'hambalimusa587@gmail.com', 'Moromti', 'Teacher', 1, '2026-05-31 23:32:24', '2026-05-31 23:32:24');

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
(1, 3, 25000.00, 'hostel', 'Hostel Accommodation Fee - Room 1 at Hostel A', 'TXN-ENWAPVSOE0', 'pending', NULL, NULL, '2026-05-31 09:44:26', '2026-05-31 09:44:26'),
(2, 3, 25000.00, 'hostel', 'HOSTEL Fee Settlement', 'TXN-QLMFVJKQL6', 'pending', NULL, NULL, '2026-05-31 10:51:09', '2026-05-31 10:51:09'),
(3, 3, 50000.00, 'hostel', 'HOSTEL Fee Settlement', 'TXN-RMJSEQFXEL', 'pending', NULL, NULL, '2026-05-31 10:52:34', '2026-05-31 10:52:34'),
(4, 3, 255000.00, 'hostel', 'Hostel Accommodation Fee - Room 1 at Hostel A', 'TXN-SINJFFPXKE', 'pending', NULL, NULL, '2026-05-31 10:54:03', '2026-05-31 10:54:03'),
(5, 3, 255000.00, 'hostel', 'Hostel Accommodation Fee - Room 1 at Hostel A', 'TXN-4CYREZPAV3', 'pending', NULL, NULL, '2026-05-31 11:00:08', '2026-05-31 11:00:08'),
(6, 5, 30000.00, 'hostel', 'Hostel Accommodation Fee - Room 10000 at Hostel A', 'TXN-1WXXRB96ZG', 'paid', 'card', '2026-05-31 17:15:00', '2026-05-31 11:07:57', '2026-05-31 17:15:00'),
(7, 5, 30000.00, 'hostel', 'HOSTEL Fee Settlement', 'TXN-FO0I17KEZ5', 'pending', NULL, NULL, '2026-05-31 11:11:11', '2026-05-31 11:11:11'),
(8, 3, 30000.00, 'hostel', 'Hostel Accommodation Fee - Room 10000 at Hostel A', 'TXN-373YKI3L4I', 'paid', 'bank_transfer', '2026-06-18 11:49:29', '2026-05-31 11:13:36', '2026-06-18 11:49:29'),
(9, 3, 30000.00, 'hostel', 'Hostel Accommodation Fee - Room 10000 at Hostel A', 'TXN-1PYFVQB1WD', 'paid', 'card', '2026-05-31 16:34:04', '2026-05-31 11:18:08', '2026-05-31 16:34:04'),
(10, 3, 670000.00, 'hostel', 'HOSTEL Fee Settlement', 'TXN-JEM8FUOEY7', 'pending', NULL, NULL, '2026-05-31 11:19:31', '2026-05-31 11:19:31'),
(11, 3, 1310000.00, 'hostel', 'HOSTEL Fee Settlement', 'TXN-FPGDXG9ICG', 'paid', 'card', '2026-05-31 16:55:42', '2026-05-31 16:55:33', '2026-05-31 16:55:42'),
(12, 3, 55000.00, 'hostel', 'Hostel Accommodation Fee - Room 1 at Hostel', 'TXN-QDFKHOZ5MZ', 'paid', 'card', '2026-05-31 18:32:03', '2026-05-31 18:31:51', '2026-05-31 18:32:03');

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
(1, 'App\\Models\\User', 3, 'auth_token', 'dbe8faddae8619a2471ce08cb4bcc35bf5302d723ef3da870bb5d282308a750b', '[\"*\"]', '2026-05-30 16:17:03', NULL, '2026-05-30 15:42:38', '2026-05-30 16:17:03'),
(2, 'App\\Models\\User', 2, 'auth_token', '813f891cab914bf418a54382bcd2d20036740a5354932f9a0ca8034b08e7e633', '[\"*\"]', '2026-05-30 16:17:27', NULL, '2026-05-30 16:17:26', '2026-05-30 16:17:27'),
(3, 'App\\Models\\User', 1, 'auth_token', 'c9c5cb9c933e569961d0798676f2d39106958692548a03243355dd521c2b37e4', '[\"*\"]', '2026-05-30 17:18:03', NULL, '2026-05-30 16:18:01', '2026-05-30 17:18:03'),
(5, 'App\\Models\\User', 3, 'auth_token', '9c80b410a76678c5766eb7a9b2cd72cdcb5d3c84fa46e43b6a3b65727915fcc8', '[\"*\"]', '2026-05-31 09:43:49', NULL, '2026-05-31 09:28:11', '2026-05-31 09:43:49'),
(7, 'App\\Models\\User', 3, 'auth_token', 'b5db304706ddc925527364687cb0ec989ed9200030abba59e5d322b7f6c5b366', '[\"*\"]', '2026-05-31 09:47:38', NULL, '2026-05-31 09:44:45', '2026-05-31 09:47:38'),
(8, 'App\\Models\\User', 2, 'auth_token', '08759f25fdea015b12c5eceab66c2da69a1a96314571a911937cd0cd71cc309f', '[\"*\"]', '2026-05-31 09:50:25', NULL, '2026-05-31 09:47:49', '2026-05-31 09:50:25'),
(9, 'App\\Models\\User', 3, 'auth_token', '230c9838682e3f14d8a4491ec460f99e6681cc4fede9b275064ecc9187454faa', '[\"*\"]', '2026-05-31 10:34:06', NULL, '2026-05-31 09:51:00', '2026-05-31 10:34:06'),
(11, 'App\\Models\\User', 3, 'auth_token', '2cbb8255c8085f6a3182d5640c3dab77e4df869f9c80812f94a58d280e9f961b', '[\"*\"]', '2026-05-31 10:42:15', NULL, '2026-05-31 10:37:24', '2026-05-31 10:42:15'),
(12, 'App\\Models\\User', 5, 'auth_token', '5918bfc5f29159a5cf4bccc53b88d3c0250b21474a5ea4f5ce19aa589dc8f5af', '[\"*\"]', '2026-05-31 10:46:29', NULL, '2026-05-31 10:44:29', '2026-05-31 10:46:29'),
(13, 'App\\Models\\User', 3, 'auth_token', '8850a85460e9e8872978ae2058c72f3256258ea74c127954d98ed732fe4c0bed', '[\"*\"]', '2026-05-31 10:59:40', NULL, '2026-05-31 10:47:03', '2026-05-31 10:59:40'),
(15, 'App\\Models\\User', 3, 'auth_token', '6bad8e2c0e6c058e7226557c93ed07dd46bca24d6eb9e4b91a5fbe96e22021b6', '[\"*\"]', '2026-05-31 11:03:13', NULL, '2026-05-31 11:00:30', '2026-05-31 11:03:13'),
(17, 'App\\Models\\User', 3, 'auth_token', '34ae3b9a489196449d6166e994de7544bc6237163a3fc26365588c1fc9e4f493', '[\"*\"]', '2026-05-31 11:06:39', NULL, '2026-05-31 11:05:33', '2026-05-31 11:06:39'),
(18, 'App\\Models\\User', 5, 'auth_token', 'f7111317ab8a816d05ee4bd3050dd1591b63a39a7fa9724d312409fa13fd3fe9', '[\"*\"]', '2026-05-31 11:12:35', NULL, '2026-05-31 11:06:50', '2026-05-31 11:12:35'),
(20, 'App\\Models\\User', 3, 'auth_token', 'b9cd6f2f456b6ce08c6ea8b4919b3c45b140e9567e6ad4114af9f5ff44d50279', '[\"*\"]', '2026-05-31 11:17:21', NULL, '2026-05-31 11:13:15', '2026-05-31 11:17:21'),
(22, 'App\\Models\\User', 3, 'auth_token', '5612df98d11cdbb4a68eba7eea0f985e921ad6a6684681dec61d0c2609a97ae5', '[\"*\"]', '2026-05-31 12:22:53', NULL, '2026-05-31 11:18:33', '2026-05-31 12:22:53'),
(23, 'App\\Models\\User', 3, 'auth_token', 'dba67cfa2f801d71d48c283295437e92277d2955e483b7ea78a73597f597cf15', '[\"*\"]', '2026-05-31 12:23:03', NULL, '2026-05-31 12:23:01', '2026-05-31 12:23:03'),
(24, 'App\\Models\\User', 3, 'auth_token', '2523e8bf68888ba12c46b306d51ce7c7d3933b4bebd764397b72e8ff6e122682', '[\"*\"]', '2026-05-31 17:14:24', NULL, '2026-05-31 16:33:22', '2026-05-31 17:14:24'),
(25, 'App\\Models\\User', 5, 'auth_token', 'b29d835e0402dbbb14032a586f64ac1b64f34b81005a3b9439fd0187de0e1329', '[\"*\"]', '2026-05-31 17:15:59', NULL, '2026-05-31 17:14:45', '2026-05-31 17:15:59'),
(27, 'App\\Models\\User', 3, 'auth_token', '795c5f594155b05e9e5fdcfa387ed1e8da3cb9009223d0baad7fd4777ebb2aaa', '[\"*\"]', '2026-05-31 17:19:22', NULL, '2026-05-31 17:18:29', '2026-05-31 17:19:22'),
(30, 'App\\Models\\User', 3, 'auth_token', '608a6dd1043fcd9fbce36cf5c699056a6f6eb7916ac07517542e20fc343c795c', '[\"*\"]', '2026-05-31 18:42:50', NULL, '2026-05-31 18:28:37', '2026-05-31 18:42:50'),
(32, 'App\\Models\\User', 3, 'auth_token', '5e80e7fcd5de171624a99dc422908ffef1fee5662cda80e1d5a817cb53bd78e5', '[\"*\"]', '2026-05-31 18:55:23', NULL, '2026-05-31 18:45:15', '2026-05-31 18:55:23'),
(34, 'App\\Models\\User', 3, 'auth_token', '3e761dd9f8a3938061827453195472c0581c888632130b2edca0882c7095e151', '[\"*\"]', '2026-05-31 19:52:08', NULL, '2026-05-31 19:10:38', '2026-05-31 19:52:08'),
(35, 'App\\Models\\User', 2, 'auth_token', '8a25a7c00557132c3fe61af47773f005239a933d629b5affbf7bc1e98c3e1e54', '[\"*\"]', '2026-05-31 20:02:21', NULL, '2026-05-31 19:52:55', '2026-05-31 20:02:21'),
(36, 'App\\Models\\User', 3, 'auth_token', 'aab22562f50c77c2cc24c666dca5b71ef43c8323d69ba35ed33eaa658e4d4967', '[\"*\"]', '2026-05-31 20:09:13', NULL, '2026-05-31 20:02:43', '2026-05-31 20:09:13'),
(37, 'App\\Models\\User', 2, 'auth_token', '71371108b9b99814d8be6ad08b712708f23b4746eba4aace3431f3d762129ddf', '[\"*\"]', '2026-05-31 20:09:41', NULL, '2026-05-31 20:09:29', '2026-05-31 20:09:41'),
(38, 'App\\Models\\User', 3, 'auth_token', '0dce07269c6b812a719512771258ecccb423c10ee76f22d28187a015523c6735', '[\"*\"]', '2026-05-31 20:11:57', NULL, '2026-05-31 20:11:39', '2026-05-31 20:11:57'),
(39, 'App\\Models\\User', 2, 'auth_token', '29638eba2ad65b7d7b1b6e4456de8171b31ab5fb9f381c55cf2fcfb980d1267d', '[\"*\"]', '2026-05-31 21:29:43', NULL, '2026-05-31 21:29:28', '2026-05-31 21:29:43'),
(40, 'App\\Models\\User', 3, 'auth_token', 'ccb94a6f15df726274b6fe8c4df658a6d80047d46ac126c7e151d30704472a96', '[\"*\"]', '2026-05-31 21:32:50', NULL, '2026-05-31 21:30:39', '2026-05-31 21:32:50'),
(41, 'App\\Models\\User', 2, 'auth_token', 'e53bf32790f51d90e25a07ae0383eb151520ef7c9712fbd452d923fea4006b99', '[\"*\"]', '2026-05-31 21:35:26', NULL, '2026-05-31 21:33:04', '2026-05-31 21:35:26'),
(42, 'App\\Models\\User', 3, 'auth_token', '52d7f8ad49f45b8ee30fe7009b4c4f366286892aeb312fa80dbd6b8d0893974c', '[\"*\"]', '2026-05-31 22:00:17', NULL, '2026-05-31 21:35:53', '2026-05-31 22:00:17'),
(43, 'App\\Models\\User', 2, 'auth_token', '38acf3afa46c25b612f6223d4d1eaebdaa7a03776f1bc7086cfc8603a601851f', '[\"*\"]', '2026-05-31 22:19:22', NULL, '2026-05-31 22:00:46', '2026-05-31 22:19:22'),
(44, 'App\\Models\\User', 3, 'auth_token', '2bfbe05dd25f22554e11831071b6ccb9678aafcb5d2600dc4decf2b88ad66491', '[\"*\"]', '2026-05-31 22:24:31', NULL, '2026-05-31 22:19:50', '2026-05-31 22:24:31'),
(45, 'App\\Models\\User', 2, 'auth_token', '7b8daa1789c4413aa093d6a0ea08ea49eb362a05b11fd416c73e2b00dc72f3df', '[\"*\"]', '2026-05-31 22:52:15', NULL, '2026-05-31 22:24:47', '2026-05-31 22:52:15'),
(46, 'App\\Models\\User', 3, 'auth_token', 'b8932c69f0f84dc61974479dfae96a2493b957c81dfabb1f8a5dd8c31f31336d', '[\"*\"]', '2026-05-31 22:53:52', NULL, '2026-05-31 22:52:35', '2026-05-31 22:53:52'),
(47, 'App\\Models\\User', 2, 'auth_token', 'b26a4e9619d0c19dac8d78682695e454faa6321459cb71939f24e7a1b7ed2a89', '[\"*\"]', '2026-05-31 23:22:10', NULL, '2026-05-31 22:54:07', '2026-05-31 23:22:10'),
(49, 'App\\Models\\User', 2, 'auth_token', 'd9f3003accfa9ffcf0ffb1712fd89d60f2c9eb05caa5392bf7d41dcf78a3f179', '[\"*\"]', '2026-05-31 23:27:38', NULL, '2026-05-31 23:26:01', '2026-05-31 23:27:38'),
(50, 'App\\Models\\User', 3, 'auth_token', '0b9b05f8b0ab7fe3a1d8e1ff0a75c886553179f957c4fc4a15ed0deea2d76da9', '[\"*\"]', '2026-05-31 23:33:12', NULL, '2026-05-31 23:27:51', '2026-05-31 23:33:12'),
(51, 'App\\Models\\User', 3, 'auth_token', '318be3a9e30d162dd61d400e62f26aca7b53f7c280aa20605b0244885771fdab', '[\"*\"]', '2026-06-01 11:56:08', NULL, '2026-06-01 11:16:27', '2026-06-01 11:56:08'),
(52, 'App\\Models\\User', 5, 'auth_token', '3957750a5f6eac8e6caf9d2bbd3f87d0fda0c0af4e1b34c0eb7ac08b76ddb953', '[\"*\"]', '2026-06-02 01:03:23', NULL, '2026-06-01 11:56:24', '2026-06-02 01:03:23'),
(54, 'App\\Models\\User', 3, 'auth_token', '12345118339497e798024bb46530f6dcfde99901053f16ce0cad4030f54b7082', '[\"*\"]', '2026-06-04 07:19:47', NULL, '2026-06-02 01:09:27', '2026-06-04 07:19:47'),
(56, 'App\\Models\\User', 3, 'auth_token', '2622d1d50f698d62afa237860579c47617d7e21a0469a28e680b8dcc16aef4a5', '[\"*\"]', '2026-06-04 08:39:22', NULL, '2026-06-04 07:24:15', '2026-06-04 08:39:22'),
(58, 'App\\Models\\User', 3, 'auth_token', 'f7a0483542a9c97c782f0df9bb461ce0454a9cc13772c8feb6f94d43214c65c3', '[\"*\"]', '2026-06-04 11:05:44', NULL, '2026-06-04 08:58:07', '2026-06-04 11:05:44'),
(59, 'App\\Models\\User', 2, 'auth_token', '2f0ec60b94de647f68dd5768644d229371f409a1c4d2b03547e8b7c283b6a105', '[\"*\"]', '2026-06-04 11:06:15', NULL, '2026-06-04 11:05:56', '2026-06-04 11:06:15'),
(60, 'App\\Models\\User', 3, 'auth_token', 'a815010fcee072ea76ec3c9b6fc3c4498a411dc7696a8ab0b4d34580240d5843', '[\"*\"]', '2026-06-04 11:12:47', NULL, '2026-06-04 11:06:29', '2026-06-04 11:12:47'),
(62, 'App\\Models\\User', 3, 'auth_token', '8aa0950427bcd757fc09a0ac714eb34b525af361c8f5a6192af7beaaa6f4e2b5', '[\"*\"]', '2026-06-18 11:37:23', NULL, '2026-06-04 11:13:36', '2026-06-18 11:37:23'),
(64, 'App\\Models\\User', 3, 'auth_token', 'fb82d12e409ae2160d262d1173137a3e6e7c8fb0578b9c0d3d3fc418474d1b24', '[\"*\"]', '2026-06-18 11:46:51', NULL, '2026-06-18 11:42:12', '2026-06-18 11:46:51'),
(66, 'App\\Models\\User', 3, 'auth_token', '6188a8e658f0dd229773eb34c3aa5b9205207fc77125d38eb4e9a35674822b87', '[\"*\"]', '2026-06-28 13:15:10', NULL, '2026-06-18 11:50:28', '2026-06-28 13:15:10');

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
  `visibility` enum('school','class','association') NOT NULL DEFAULT 'school',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id`, `user_id`, `association_id`, `content`, `media_path`, `type`, `visibility`, `created_at`, `updated_at`) VALUES
(1, 3, NULL, 'Just finished the first lecture on Database Systems. KIU Explorer makes it so easy to follow up with tutorials! #KIU #ComputerScience', NULL, 'social', 'school', '2026-05-30 16:28:30', '2026-05-30 16:28:30'),
(2, 3, NULL, 'Anyone joining the SQL workshop tomorrow? Let’s group up!', NULL, 'social', 'school', '2026-05-30 16:28:30', '2026-05-30 16:28:30'),
(3, 5, NULL, 'Testing', NULL, 'social', 'school', '2026-05-31 10:45:17', '2026-05-31 10:45:17'),
(4, 3, 2, 'Hello', NULL, 'social', 'association', '2026-05-31 18:36:30', '2026-05-31 18:36:30'),
(5, 3, 2, '📢 HELLO\n\nHello', NULL, 'news', 'association', '2026-05-31 19:20:09', '2026-05-31 19:20:09'),
(6, 3, NULL, 'Just finished the first lecture on Database Systems. KIU Explorer makes it so easy to follow up with tutorials! #KIU #ComputerScience', NULL, 'social', 'school', '2026-06-04 10:43:33', '2026-06-04 10:43:33'),
(7, 3, NULL, 'Anyone joining the SQL workshop tomorrow? Let’s group up!', NULL, 'social', 'school', '2026-06-04 10:43:33', '2026-06-04 10:43:33');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `shop_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `gallery` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`gallery`)),
  `category` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `shop_id`, `name`, `description`, `price`, `image_url`, `gallery`, `category`, `status`, `created_at`, `updated_at`) VALUES
(7, 3, 'Spiced Jollof Rice & Chicken', 'Delicious smoked jollof rice served with a large piece of grilled chicken and plantain.', 2500.00, NULL, NULL, 'Food', 'active', '2026-06-04 06:51:11', '2026-06-04 06:51:11'),
(8, 3, 'Cold Brew Iced Coffee', 'Freshly brewed cold coffee. Stay alert during your morning lectures.', 1200.00, NULL, NULL, 'Food', 'active', '2026-06-04 06:51:11', '2026-06-04 06:51:11'),
(9, 3, 'Chocolate Glazed Donuts (Box of 4)', 'Freshly baked chocolate glazed donuts. Perfect snack for study groups.', 1800.00, NULL, NULL, 'Food', 'active', '2026-06-04 06:51:11', '2026-06-04 06:51:11');

-- --------------------------------------------------------

--
-- Table structure for table `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `rating` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `media_type` enum('image','video','none') NOT NULL DEFAULT 'none',
  `media_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_reviews`
--

INSERT INTO `product_reviews` (`id`, `product_id`, `user_id`, `rating`, `description`, `media_type`, `media_url`, `created_at`, `updated_at`) VALUES
(1, 7, 3, 4, 'Hello', 'image', 'storage/marketplace/reviews/6a215ab45356f_1780570804.jpeg', '2026-06-04 10:00:04', '2026-06-04 10:00:04');

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
(1, 1, 'M.B.B.S Medicine and Surgery', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(2, 2, 'B.NSC. Nursing Science', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(3, 3, 'D. PT Physiotherapy', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(4, 4, 'B.Sc. Radiography', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(5, 5, 'B.MLS. Medical Laboratory Science', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(6, 6, 'B.Sc. Health Information Management', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(7, 7, 'B. Agriculture', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(8, 8, 'B. Sc. Animal & Environmental Biology', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(9, 9, 'B.Sc Biotechnology', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(10, 10, 'B. Sc. Plant Science & Biotechnology', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(11, 11, 'B. Sc. Computer Science', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(12, 12, 'B. Sc. Mathematics', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(13, 13, 'B. Sc. Statistics', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(14, 14, 'B. Sc. Chemistry', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(15, 15, 'B. Sc. Physics', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(16, 16, 'B.SC. Biochemistry', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(17, 17, 'B. Sc. Accounting', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(18, 18, 'B. Sc. Business Administration', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(19, 19, 'B. Sc. Economics', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(20, 20, 'B. Sc. Criminology and Security Studies', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(21, 21, 'B. Sc. Geography', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(22, 22, 'B. Sc. Mass Communication', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(23, 23, 'B Sc. Public Administration', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(24, 24, 'B. Sc. Political Science', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(25, 25, 'B. Sc. Peace Studies & Conflict Resolution', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(26, 26, 'B. Sc. Sociology', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(27, 27, 'B. A. (Ed.) Education/English', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(28, 28, 'B. A. (Ed.) Education/Islamic Studies', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(29, 29, 'B.Sc.(Ed.) Education/Economics', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(30, 30, 'B.Sc.(Ed.) Education/Mathematics', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(31, 31, 'B.Sc.(Ed.) Education/Physics', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(32, 32, 'B.Sc.(Ed.) Education/Computer Science', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(33, 33, 'B.Sc.(Ed.) Education/Chemistry', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(34, 34, 'B.Sc.(Ed.) Education/Biology', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(35, 35, 'B.A. English Language', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(36, 36, 'B.A. Literature in English', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30'),
(37, 37, 'B.A. Islamic Studies', NULL, NULL, NULL, '2026-06-04 10:43:30', '2026-06-04 10:43:30');

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

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`id`, `reportable_type`, `reportable_id`, `reporter_id`, `reason`, `status`, `admin_notes`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\Post', 3, 3, 'In allro', 'reviewed', 'Report investigated and dismissed by Moderator', '2026-05-31 18:55:23', '2026-05-31 18:56:21');

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

--
-- Dumping data for table `school_info`
--

INSERT INTO `school_info` (`id`, `school_name`, `background`, `history`, `vision`, `mission`, `core_values`, `logo_url`, `motto`, `established_year`, `address`, `phone`, `email`, `website`, `created_at`, `updated_at`) VALUES
(1, 'Kashim Ibrahim University', 'Kashim Ibrahim University (KIU) is a premier institution dedicated to academic excellence, innovative research, and character building.', 'Founded to bridge the educational gap and foster technical and moral excellence in the region, Kashim Ibrahim University has grown into a world-class center of learning.', 'To be a globally recognized center of academic excellence and societal transformation.', 'To provide high-quality education, foster research-driven innovation, and produce graduates of outstanding character.', 'Integrity, Diligence, Innovation, and Excellence', NULL, 'Knowledge, Character, and Service', '2016', 'Kashim Ibrahim University Campus, Borno State, Nigeria', '+234 803 123 4567', 'info@kiu.edu.ng', 'https://kiu.edu.ng', '2026-05-30 16:16:08', '2026-05-30 16:33:01');

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

--
-- Dumping data for table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('7lxDN6NqsNUM688m6baaHzjNEdDJT5tQaOLXeJ1N', NULL, '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiOEU0eUZiUFY5cnU5SnZRVjU0Zmo0cEtRUmdqSGVPalpwSjR1TWY4QiI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJuZXciO2E6MDp7fXM6Mzoib2xkIjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6NjA6Imh0dHA6Ly9sb2NhbGhvc3QvYXBwL0tJVSUyMEVYUExPUkVSL2JhY2tlbmQvcHVibGljL2Ntcy9sb2dpbiI7czo1OiJyb3V0ZSI7czo5OiJjbXMubG9naW4iO319', 1782668618);

-- --------------------------------------------------------

--
-- Table structure for table `shops`
--

CREATE TABLE `shops` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `banner` varchar(255) DEFAULT NULL,
  `contact_phone` varchar(255) NOT NULL,
  `whatsapp_number` varchar(255) DEFAULT NULL,
  `contact_email` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shops`
--

INSERT INTO `shops` (`id`, `user_id`, `name`, `description`, `logo`, `banner`, `contact_phone`, `whatsapp_number`, `contact_email`, `status`, `created_at`, `updated_at`) VALUES
(3, 5, 'Campus Bites & Grill', 'Hot meals, pastries, drinks, and snacks delivered to your hostel room. Order your lunch and dinner here!', NULL, NULL, '07087745552', '07087745552', 'test@gmail.com', 'active', '2026-06-04 06:51:10', '2026-06-04 06:51:10');

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

--
-- Dumping data for table `staff_directory`
--

INSERT INTO `staff_directory` (`id`, `staff_id`, `title`, `surname`, `first_name`, `other_names`, `position`, `faculty_id`, `department_id`, `office_location`, `email`, `phone`, `photo_url`, `specialization`, `qualifications`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'STF-001', 'Prof.', 'Okonkwo', 'Chidi', NULL, 'Dean of Science', 1, 11, 'Testing', 'dean.science@kiu.edu.ng', '07087774512', 'http://192.168.183.249:8000/storage/staff-photos/6a1cd15f2cb33_1780273503.jpeg', 'Cyber security', 'Ph D', 1, '2026-05-30 16:28:30', '2026-05-31 23:25:03'),
(2, 'KIU-L-685', 'Dr.', 'Hsh', 'Testin', NULL, 'Senior', 1, 38, 'Testing', 'Seni@gmail.com', '070787878494', 'http://192.168.183.249:8000/storage/staff-photos/6a1cd0f68ba8d_1780273398.jpeg', 'Computer', 'Bsc', 1, '2026-05-31 08:27:51', '2026-05-31 23:23:18');

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

--
-- Dumping data for table `student_documents`
--

INSERT INTO `student_documents` (`id`, `student_id`, `document_type`, `file_name`, `file_path`, `file_size`, `mime_type`, `is_verified`, `verified_by`, `verified_at`, `verification_notes`, `created_at`, `updated_at`) VALUES
(1, 3, 'admission_letter', '5100dd27-a777-4ab8-ab9f-4d3efaddf6ee.pdf', 'documents/students/45394a03-e696-48a5-a888-45047c685e5c.pdf', 123532, 'application/pdf', 0, NULL, NULL, NULL, '2026-05-31 23:33:07', '2026-05-31 23:33:07');

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
(1, 3, NULL, 11, NULL, 1, '300', NULL, NULL, NULL, 'active', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-30 16:28:30', '2026-05-30 16:28:30'),
(2, 5, 3, 11, 11, 2, '100', NULL, NULL, NULL, 'active', 'Husseini', 'Father', '0780777845', NULL, 'Moromti', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-31 10:44:29', '2026-05-31 10:44:29');

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

--
-- Dumping data for table `system_alerts`
--

INSERT INTO `system_alerts` (`id`, `type`, `title`, `message`, `severity`, `is_resolved`, `resolved_at`, `resolved_by`, `metadata`, `created_at`, `updated_at`) VALUES
(1, 'info', 'Testing', 'Testing', 4, 0, NULL, NULL, NULL, '2026-05-30 16:23:07', '2026-05-30 16:23:07'),
(2, 'info', 'Testing', 'Tetsghs', 3, 0, NULL, NULL, NULL, '2026-05-30 16:39:01', '2026-05-30 16:39:01');

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
(1, NULL, NULL, 3, 'Computer &amp; Technology Basics Course for Absolute Beginners', 'Learn basic computer and technology skills. This course is for people new to working with computers or people that want to fill in ...', NULL, 'youtube', NULL, NULL, 'y2kg3MOk1sY', 'youtube', 5, 'active', '2026-05-30 15:43:30', '2026-06-18 12:52:29'),
(2, NULL, 'CSC 101', 2, 'Introduction', 'Introduction', 'tutorials/RkWQFcVfbTBBCh4usr1yaYmnShSJ3yQcUaBqSY8P.mp4', 'video', 'video/mp4', 3373290, NULL, 'file', 6, 'active', '2026-05-31 09:50:12', '2026-06-18 12:51:57'),
(3, NULL, NULL, 3, 'Calculus 1 - Introduction to Limits', 'This calculus 1 video tutorial provides an introduction to limits. It explains how to evaluate limits by direct substitution, by factoring, ...', NULL, 'youtube', NULL, NULL, 'YNstP0ESndU', 'youtube', 4, 'active', '2026-06-04 11:27:32', '2026-06-18 12:52:50'),
(4, NULL, NULL, 3, 'What is Software Engineering - Simple Explanation', 'Join Telegram Channel: https://t.me/habeebcodes Software engineering is more than just coding — it\'s about applying ...', NULL, 'youtube', NULL, NULL, 'Mw-cECLLUpo', 'youtube', 1, 'active', '2026-06-18 13:42:52', '2026-06-18 13:42:53');

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
  `expo_push_token` varchar(255) DEFAULT NULL,
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

INSERT INTO `users` (`id`, `user_id`, `matric_number`, `surname`, `first_name`, `other_names`, `gender`, `dob`, `nationality`, `state_of_origin`, `lga`, `passport_photograph`, `email`, `phone_number`, `alternative_phone_number`, `residential_address`, `city`, `state_of_residence`, `username`, `role`, `account_status`, `expo_push_token`, `last_login_date`, `email_verified_at`, `password`, `remember_token`, `notification_preferences`, `created_at`, `updated_at`) VALUES
(1, 'ADMIN-001', NULL, 'Admin', 'System', NULL, 'Male', NULL, 'Nigerian', NULL, NULL, NULL, 'admin@kiu.edu.ng', NULL, NULL, NULL, NULL, NULL, 'admin', 'admin', 'active', NULL, NULL, NULL, '$2y$12$YmWM5VNHZgcjaYzXfbhPi.EuPz7SNpfMBq1/pVuT8P9YbvFgxezQi', NULL, NULL, '2026-05-30 15:40:16', '2026-05-30 15:40:16'),
(2, 'LEC-001', NULL, 'Ibrahim', 'Dr. Ali', NULL, 'Male', NULL, 'Nigerian', NULL, NULL, NULL, 'lecturer@kiu.edu.ng', NULL, NULL, NULL, NULL, NULL, 'ali_lecturer', 'lecturer', 'active', NULL, NULL, NULL, '$2y$12$t992uhecuEd2vsh5N2mdkO2zVOHrkK.Eyaqkq6Mz0mBwZYNMx/D3u', NULL, NULL, '2026-05-30 15:40:17', '2026-05-30 15:40:17'),
(3, 'STU-001', 'KIU/2023/CSC/001', 'Musa', 'Abubakar', NULL, 'Male', NULL, 'Nigerian', 'Kano', NULL, 'storage/profile-photos/6a33df1281be8_1781784338.jpeg', 'student@kiu.edu.ng', '08012345678', NULL, NULL, NULL, NULL, 'abubakar_musa', 'student', 'active', NULL, NULL, NULL, '$2y$12$qOxjlbg3m489Avit8wgsh.8iXBMqGdFhkiI5xn4KLnsNhWE9apiPq', NULL, '{\"push_notifications\":true,\"email_notifications\":true,\"news_updates\":true,\"assignment_alerts\":true,\"event_reminders\":true}', '2026-05-30 15:40:17', '2026-06-18 11:05:38'),
(5, 'KIU-6A1C1F1D18CCA', 'Kiu/20/20/20/20', 'Mustapha', 'Umar', NULL, 'Male', '2002-01-01', 'Nigerian', 'Borno', 'Bama', 'storage/profile-photos/6a1c1f1cac682_1780227868.jpeg', 'test@gmail.com', '07087745552', NULL, 'Moromti', 'Bama', 'Borno', NULL, 'student', 'active', NULL, NULL, NULL, '$2y$12$nQY7Lbhw6iLeb4QHzKQCEudU7DJVKxnnXM9xb9omzwmidNZUNSvGK', NULL, NULL, '2026-05-31 10:44:29', '2026-05-31 10:44:29'),
(6, NULL, NULL, 'Test', 'Lecturer', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'dr.test@kiu.edu.ng', NULL, NULL, NULL, NULL, NULL, NULL, 'lecturer', 'active', NULL, NULL, NULL, '$2y$12$/M2fVCbXWOa6zPYwPI6xfu8yg0SnsU58/NwdkxHl6WLFK1fLF49RW', NULL, NULL, '2026-05-31 16:00:44', '2026-05-31 17:07:29');

-- --------------------------------------------------------

--
-- Table structure for table `vault_documents`
--

CREATE TABLE `vault_documents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(255) NOT NULL,
  `category` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_size` int(11) NOT NULL,
  `mime_type` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `is_pinned` tinyint(1) NOT NULL DEFAULT 0,
  `is_encrypted` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vault_documents`
--

INSERT INTO `vault_documents` (`id`, `user_id`, `title`, `category`, `file_name`, `file_path`, `file_size`, `mime_type`, `description`, `is_pinned`, `is_encrypted`, `created_at`, `updated_at`) VALUES
(1, 3, 'Admission', 'admission_letter', 'CSC%20404-Databse%20management%20Lecture%20note%20II.pdf', 'vault/05784953-9f71-406f-8b49-e3d228899994.enc', 939234, 'application/pdf', NULL, 0, 1, '2026-06-04 12:18:23', '2026-06-04 12:18:23');

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
  `is_chat_muted` tinyint(1) NOT NULL DEFAULT 0,
  `is_recorded` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `virtual_classes`
--

INSERT INTO `virtual_classes` (`id`, `course_id`, `lecturer_id`, `title`, `description`, `scheduled_at`, `duration`, `meeting_link`, `recording_url`, `status`, `is_chat_muted`, `is_recorded`, `created_at`, `updated_at`) VALUES
(2, 3, 2, 'Introduction', 'Introduction', '2026-05-31 21:05:11', 6, 'https://meet.jit.si/SilentPublicationsStageDiscreetly', NULL, 'ended', 0, 0, '2026-05-31 20:02:11', '2026-05-31 21:33:20'),
(3, 3, 2, 'Testing', 'Testing', '2026-05-31 22:35:42', 2, 'https://us05web.zoom.us/j/4583673182?pwd=AFnV4cbMVciR3yddIYXhbSuijmgke6.1', NULL, 'ended', 0, 0, '2026-05-31 21:35:13', '2026-05-31 22:00:57'),
(4, 3, 2, 'Introduction to Computer', 'Introduction', '2026-05-31 23:20:14', 2, 'https://us05web.zoom.us/j/81052757501?pwd=DUkma3YrtoxhIR6ar6T1aeXbszuJsb.1', NULL, 'ended', 0, 0, '2026-05-31 22:19:03', '2026-05-31 22:24:58'),
(5, 5, 2, 'SQL Queries Workshop', NULL, '2026-06-05 10:43:33', 60, NULL, NULL, 'ended', 0, 0, '2026-06-04 10:43:33', '2026-06-04 11:06:15');

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
-- Indexes for table `adverts`
--
ALTER TABLE `adverts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `adverts_created_by_foreign` (`created_by`);

--
-- Indexes for table `ai_conversations`
--
ALTER TABLE `ai_conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ai_conversations_user_id_foreign` (`user_id`);

--
-- Indexes for table `ai_messages`
--
ALTER TABLE `ai_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ai_messages_ai_conversation_id_foreign` (`ai_conversation_id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `announcements_published_by_foreign` (`published_by`);

--
-- Indexes for table `app_developers`
--
ALTER TABLE `app_developers`
  ADD PRIMARY KEY (`id`);

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `associations_president_id_foreign` (`president_id`);

--
-- Indexes for table `association_documents`
--
ALTER TABLE `association_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `association_documents_association_id_foreign` (`association_id`),
  ADD KEY `association_documents_uploaded_by_foreign` (`uploaded_by`);

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
-- Indexes for table `blog_posts`
--
ALTER TABLE `blog_posts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `blog_posts_slug_unique` (`slug`);

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
-- Indexes for table `download_logs`
--
ALTER TABLE `download_logs`
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `gallery_items`
--
ALTER TABLE `gallery_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `general_attendance`
--
ALTER TABLE `general_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `general_attendance_student_id_attendance_date_unique` (`student_id`,`attendance_date`),
  ADD KEY `general_attendance_marked_by_foreign` (`marked_by`);

--
-- Indexes for table `gpa_entries`
--
ALTER TABLE `gpa_entries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gpa_entries_user_id_foreign` (`user_id`);

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
-- Indexes for table `hostel_attendance`
--
ALTER TABLE `hostel_attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hostel_attendance_student_id_foreign` (`student_id`),
  ADD KEY `hostel_attendance_hostel_id_foreign` (`hostel_id`),
  ADD KEY `hostel_attendance_room_id_foreign` (`room_id`);

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
  ADD KEY `hostel_complaints_student_id_status_index` (`student_id`,`status`),
  ADD KEY `hostel_complaints_hostel_id_index` (`hostel_id`),
  ADD KEY `hostel_complaints_hostel_room_id_foreign` (`hostel_room_id`);

--
-- Indexes for table `hostel_heads`
--
ALTER TABLE `hostel_heads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hostel_heads_hostel_id_foreign` (`hostel_id`);

--
-- Indexes for table `hostel_leaves`
--
ALTER TABLE `hostel_leaves`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hostel_leaves_student_id_foreign` (`student_id`),
  ADD KEY `hostel_leaves_hostel_id_foreign` (`hostel_id`),
  ADD KEY `hostel_leaves_room_id_foreign` (`room_id`),
  ADD KEY `hostel_leaves_approved_by_foreign` (`approved_by`);

--
-- Indexes for table `hostel_roommate_profiles`
--
ALTER TABLE `hostel_roommate_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `hostel_roommate_profiles_student_id_unique` (`student_id`);

--
-- Indexes for table `hostel_rooms`
--
ALTER TABLE `hostel_rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hostel_rooms_hostel_id_foreign` (`hostel_id`);

--
-- Indexes for table `hostel_rules`
--
ALTER TABLE `hostel_rules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hostel_rules_hostel_id_foreign` (`hostel_id`);

--
-- Indexes for table `hostel_visitors`
--
ALTER TABLE `hostel_visitors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hostel_visitors_student_id_foreign` (`student_id`),
  ADD KEY `hostel_visitors_hostel_id_foreign` (`hostel_id`),
  ADD KEY `hostel_visitors_room_id_foreign` (`room_id`);

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
-- Indexes for table `landing_page_settings`
--
ALTER TABLE `landing_page_settings`
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
-- Indexes for table `lost_items`
--
ALTER TABLE `lost_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lost_items_user_id_foreign` (`user_id`);

--
-- Indexes for table `lost_item_comments`
--
ALTER TABLE `lost_item_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `lost_item_comments_lost_item_id_foreign` (`lost_item_id`),
  ADD KEY `lost_item_comments_user_id_foreign` (`user_id`);

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
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_shop_id_foreign` (`shop_id`);

--
-- Indexes for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_reviews_product_id_foreign` (`product_id`),
  ADD KEY `product_reviews_user_id_foreign` (`user_id`);

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
-- Indexes for table `shops`
--
ALTER TABLE `shops`
  ADD PRIMARY KEY (`id`),
  ADD KEY `shops_user_id_foreign` (`user_id`);

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
-- Indexes for table `vault_documents`
--
ALTER TABLE `vault_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vault_documents_user_id_foreign` (`user_id`);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

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
-- AUTO_INCREMENT for table `adverts`
--
ALTER TABLE `adverts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `ai_conversations`
--
ALTER TABLE `ai_conversations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `ai_messages`
--
ALTER TABLE `ai_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `app_developers`
--
ALTER TABLE `app_developers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `assignment_submissions`
--
ALTER TABLE `assignment_submissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `associations`
--
ALTER TABLE `associations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `association_documents`
--
ALTER TABLE `association_documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `association_members`
--
ALTER TABLE `association_members`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `attendances`
--
ALTER TABLE `attendances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `blog_posts`
--
ALTER TABLE `blog_posts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `campus_locations`
--
ALTER TABLE `campus_locations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `comments`
--
ALTER TABLE `comments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `conversation_participants`
--
ALTER TABLE `conversation_participants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `courses`
--
ALTER TABLE `courses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `course_allocations`
--
ALTER TABLE `course_allocations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `course_registrations`
--
ALTER TABLE `course_registrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `download_logs`
--
ALTER TABLE `download_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `event_registrations`
--
ALTER TABLE `event_registrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `exams`
--
ALTER TABLE `exams`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exam_attempts`
--
ALTER TABLE `exam_attempts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exam_responses`
--
ALTER TABLE `exam_responses`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `friend_requests`
--
ALTER TABLE `friend_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `gallery_items`
--
ALTER TABLE `gallery_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `general_attendance`
--
ALTER TABLE `general_attendance`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gpa_entries`
--
ALTER TABLE `gpa_entries`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `hostel_attendance`
--
ALTER TABLE `hostel_attendance`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `hostel_beds`
--
ALTER TABLE `hostel_beds`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `hostel_bookings`
--
ALTER TABLE `hostel_bookings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `hostel_complaints`
--
ALTER TABLE `hostel_complaints`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `hostel_heads`
--
ALTER TABLE `hostel_heads`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hostel_leaves`
--
ALTER TABLE `hostel_leaves`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hostel_roommate_profiles`
--
ALTER TABLE `hostel_roommate_profiles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `hostel_rooms`
--
ALTER TABLE `hostel_rooms`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `hostel_rules`
--
ALTER TABLE `hostel_rules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `hostel_visitors`
--
ALTER TABLE `hostel_visitors`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `landing_page_settings`
--
ALTER TABLE `landing_page_settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `lecturer_profiles`
--
ALTER TABLE `lecturer_profiles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `library_resources`
--
ALTER TABLE `library_resources`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `likes`
--
ALTER TABLE `likes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `lost_items`
--
ALTER TABLE `lost_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `lost_item_comments`
--
ALTER TABLE `lost_item_comments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `options`
--
ALTER TABLE `options`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `parent_guardians`
--
ALTER TABLE `parent_guardians`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `programmes`
--
ALTER TABLE `programmes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `school_info`
--
ALTER TABLE `school_info`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `school_rules`
--
ALTER TABLE `school_rules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `shops`
--
ALTER TABLE `shops`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `staff_directory`
--
ALTER TABLE `staff_directory`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `student_documents`
--
ALTER TABLE `student_documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `student_profiles`
--
ALTER TABLE `student_profiles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `support_tickets`
--
ALTER TABLE `support_tickets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_alerts`
--
ALTER TABLE `system_alerts`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `tutorials`
--
ALTER TABLE `tutorials`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `vault_documents`
--
ALTER TABLE `vault_documents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `virtual_classes`
--
ALTER TABLE `virtual_classes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `virtual_class_messages`
--
ALTER TABLE `virtual_class_messages`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `adverts`
--
ALTER TABLE `adverts`
  ADD CONSTRAINT `adverts_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ai_conversations`
--
ALTER TABLE `ai_conversations`
  ADD CONSTRAINT `ai_conversations_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `ai_messages`
--
ALTER TABLE `ai_messages`
  ADD CONSTRAINT `ai_messages_ai_conversation_id_foreign` FOREIGN KEY (`ai_conversation_id`) REFERENCES `ai_conversations` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `associations`
--
ALTER TABLE `associations`
  ADD CONSTRAINT `associations_president_id_foreign` FOREIGN KEY (`president_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `association_documents`
--
ALTER TABLE `association_documents`
  ADD CONSTRAINT `association_documents_association_id_foreign` FOREIGN KEY (`association_id`) REFERENCES `associations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `association_documents_uploaded_by_foreign` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `gpa_entries`
--
ALTER TABLE `gpa_entries`
  ADD CONSTRAINT `gpa_entries_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `hostel_attendance`
--
ALTER TABLE `hostel_attendance`
  ADD CONSTRAINT `hostel_attendance_hostel_id_foreign` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hostel_attendance_room_id_foreign` FOREIGN KEY (`room_id`) REFERENCES `hostel_rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hostel_attendance_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `hostel_heads`
--
ALTER TABLE `hostel_heads`
  ADD CONSTRAINT `hostel_heads_hostel_id_foreign` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hostel_leaves`
--
ALTER TABLE `hostel_leaves`
  ADD CONSTRAINT `hostel_leaves_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `hostel_leaves_hostel_id_foreign` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hostel_leaves_room_id_foreign` FOREIGN KEY (`room_id`) REFERENCES `hostel_rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hostel_leaves_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hostel_roommate_profiles`
--
ALTER TABLE `hostel_roommate_profiles`
  ADD CONSTRAINT `hostel_roommate_profiles_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hostel_rooms`
--
ALTER TABLE `hostel_rooms`
  ADD CONSTRAINT `hostel_rooms_hostel_id_foreign` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hostel_rules`
--
ALTER TABLE `hostel_rules`
  ADD CONSTRAINT `hostel_rules_hostel_id_foreign` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `hostel_visitors`
--
ALTER TABLE `hostel_visitors`
  ADD CONSTRAINT `hostel_visitors_hostel_id_foreign` FOREIGN KEY (`hostel_id`) REFERENCES `hostels` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hostel_visitors_room_id_foreign` FOREIGN KEY (`room_id`) REFERENCES `hostel_rooms` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hostel_visitors_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `lost_items`
--
ALTER TABLE `lost_items`
  ADD CONSTRAINT `lost_items_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lost_item_comments`
--
ALTER TABLE `lost_item_comments`
  ADD CONSTRAINT `lost_item_comments_lost_item_id_foreign` FOREIGN KEY (`lost_item_id`) REFERENCES `lost_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `lost_item_comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_shop_id_foreign` FOREIGN KEY (`shop_id`) REFERENCES `shops` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `product_reviews_product_id_foreign` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `shops`
--
ALTER TABLE `shops`
  ADD CONSTRAINT `shops_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
-- Constraints for table `vault_documents`
--
ALTER TABLE `vault_documents`
  ADD CONSTRAINT `vault_documents_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

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
