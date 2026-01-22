-- SQL Dump for KIU EXPLORER Academic Structure
-- Simply Copy and Paste this entire block into the SQL tab in phpMyAdmin

SET FOREIGN_KEY_CHECKS=0;

-- 1. Create Faculties Table
CREATE TABLE IF NOT EXISTS `faculties` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `faculties_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create Departments Table
CREATE TABLE IF NOT EXISTS `departments` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `faculty_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `departments_faculty_id_foreign` (`faculty_id`),
  CONSTRAINT `departments_faculty_id_foreign` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create Programmes Table
CREATE TABLE IF NOT EXISTS `programmes` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `department_id` bigint(20) unsigned NOT NULL,
  `name` varchar(255) NOT NULL,
  `degree_type` varchar(255) DEFAULT NULL,
  `duration` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `programmes_department_id_foreign` (`department_id`),
  CONSTRAINT `programmes_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Create Academic Sessions Table
CREATE TABLE IF NOT EXISTS `academic_sessions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT 0,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `academic_sessions_name_unique` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Insert Data

-- Faculty of Basic Medical and Allied Health Science (ID: 1)
INSERT INTO `faculties` (`id`, `name`, `created_at`, `updated_at`) VALUES (1, 'Faculty of Basic Medical and Allied Health Science', NOW(), NOW());
-- Depts
INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (1, 1, 'Medicine and Surgery', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (1, 1, 'M.B.B.S Medicine and Surgery', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (2, 1, 'Nursing Science', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (2, 2, 'B.NSC. Nursing Science', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (3, 1, 'Physiotherapy', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (3, 3, 'D. PT Physiotherapy', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (4, 1, 'Radiography', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (4, 4, 'B.Sc. Radiography', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (5, 1, 'Medical Laboratory Science', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (5, 5, 'B.MLS. Medical Laboratory Science', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (6, 1, 'Health Information Management', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (6, 6, 'B.Sc. Health Information Management', NOW(), NOW());

-- Faculty of Agriculture (ID: 2)
INSERT INTO `faculties` (`id`, `name`, `created_at`, `updated_at`) VALUES (2, 'Faculty of Agriculture', NOW(), NOW());
INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (7, 2, 'Agriculture', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (7, 7, 'B. Agriculture', NOW(), NOW());

-- Faculty of Science (ID: 3)
INSERT INTO `faculties` (`id`, `name`, `created_at`, `updated_at`) VALUES (3, 'Faculty of Science', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (8, 3, 'Animal and Environmental Biology', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (8, 8, 'B. Sc. Animal & Environmental Biology', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (9, 3, 'Biotechnology', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (9, 9, 'B.Sc Biotechnology', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (10, 3, 'Plant Science and Biotechnology', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (10, 10, 'B. Sc. Plant Science & Biotechnology', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (11, 3, 'Computer Science', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (11, 11, 'B. Sc. Computer Science', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (12, 3, 'Mathematics', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (12, 12, 'B. Sc. Mathematics', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (13, 3, 'Statistics', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (13, 13, 'B. Sc. Statistics', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (14, 3, 'Chemistry', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (14, 14, 'B. Sc. Chemistry', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (15, 3, 'Physics', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (15, 15, 'B. Sc. Physics', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (16, 3, 'Biochemistry', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (16, 16, 'B.SC. Biochemistry', NOW(), NOW());

-- Faculty of Social & Management Sciences (ID: 4)
INSERT INTO `faculties` (`id`, `name`, `created_at`, `updated_at`) VALUES (4, 'Faculty of Social & Management Sciences', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (17, 4, 'Accounting', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (17, 17, 'B. Sc. Accounting', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (18, 4, 'Business Administration', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (18, 18, 'B. Sc. Business Administration', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (19, 4, 'Economics', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (19, 19, 'B. Sc. Economics', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (20, 4, 'Criminology and Security Studies', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (20, 20, 'B. Sc. Criminology and Security Studies', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (21, 4, 'Geography', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (21, 21, 'B. Sc. Geography', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (22, 4, 'Mass Communication', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (22, 22, 'B. Sc. Mass Communication', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (23, 4, 'Public Administration', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (23, 23, 'B Sc. Public Administration', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (24, 4, 'Political Science', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (24, 24, 'B. Sc. Political Science', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (25, 4, 'Peace Studies and Conflict Resolution', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (25, 25, 'B. Sc. Peace Studies & Conflict Resolution', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (26, 4, 'Sociology', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (26, 26, 'B. Sc. Sociology', NOW(), NOW());

-- Faculty of Art and Education (ID: 5)
INSERT INTO `faculties` (`id`, `name`, `created_at`, `updated_at`) VALUES (5, 'Faculty of Art and Education', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (27, 5, 'Education English', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (27, 27, 'B. A. (Ed.) Education/English', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (28, 5, 'Education Islamic Studies', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (28, 28, 'B. A. (Ed.) Education/Islamic Studies', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (29, 5, 'Education Economics', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (29, 29, 'B.Sc.(Ed.) Education/Economics', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (30, 5, 'Education Mathematics', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (30, 30, 'B.Sc.(Ed.) Education/Mathematics', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (31, 5, 'Education Physics', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (31, 31, 'B.Sc.(Ed.) Education/Physics', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (32, 5, 'Education Computer Science', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (32, 32, 'B.Sc.(Ed.) Education/Computer Science', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (33, 5, 'Education Chemistry', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (33, 33, 'B.Sc.(Ed.) Education/Chemistry', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (34, 5, 'Education Biology', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (34, 34, 'B.Sc.(Ed.) Education/Biology', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (35, 5, 'English Language', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (35, 35, 'B.A. English Language', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (36, 5, 'Literature in English', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (36, 36, 'B.A. Literature in English', NOW(), NOW());

INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES (37, 5, 'Islamic Studies', NOW(), NOW());
INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES (37, 37, 'B.A. Islamic Studies', NOW(), NOW());

-- Academic Sessions
INSERT INTO `academic_sessions` (`name`, `is_current`, `created_at`, `updated_at`) VALUES ('2025/2026', 1, NOW(), NOW());
INSERT INTO `academic_sessions` (`name`, `is_current`, `created_at`, `updated_at`) VALUES ('2026/2027', 0, NOW(), NOW());

SET FOREIGN_KEY_CHECKS=1;
