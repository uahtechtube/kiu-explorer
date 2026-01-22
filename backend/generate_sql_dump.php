<?php

// 1. DATA DEFINITION
$faculties = [
    'Faculty of Basic Medical and Allied Health Science' => [
        'Medicine and Surgery' => ['M.B.B.S Medicine and Surgery'],
        'Nursing Science' => ['B.NSC. Nursing Science'],
        'Physiotherapy' => ['D. PT Physiotherapy'],
        'Radiography' => ['B.Sc. Radiography'],
        'Medical Laboratory Science' => ['B.MLS. Medical Laboratory Science'],
        'Health Information Management' => ['B.Sc. Health Information Management']
    ],
    'Faculty of Agriculture' => [
        'Agriculture' => ['B. Agriculture']
    ],
    'Faculty of Science' => [
        'Animal and Environmental Biology' => ['B. Sc. Animal & Environmental Biology'],
        'Biotechnology' => ['B.Sc Biotechnology'],
        'Plant Science and Biotechnology' => ['B. Sc. Plant Science & Biotechnology'],
        'Computer Science' => ['B. Sc. Computer Science'],
        'Mathematics' => ['B. Sc. Mathematics'],
        'Statistics' => ['B. Sc. Statistics'],
        'Chemistry' => ['B. Sc. Chemistry'],
        'Physics' => ['B. Sc. Physics'],
        'Biochemistry' => ['B.SC. Biochemistry']
    ],
    'Faculty of Social & Management Sciences' => [
        'Accounting' => ['B. Sc. Accounting'],
        'Business Administration' => ['B. Sc. Business Administration'],
        'Economics' => ['B. Sc. Economics'],
        'Criminology and Security Studies' => ['B. Sc. Criminology and Security Studies'],
        'Geography' => ['B. Sc. Geography'],
        'Mass Communication' => ['B. Sc. Mass Communication'],
        'Public Administration' => ['B Sc. Public Administration'],
        'Political Science' => ['B. Sc. Political Science'],
        'Peace Studies and Conflict Resolution' => ['B. Sc. Peace Studies & Conflict Resolution'],
        'Sociology' => ['B. Sc. Sociology']
    ],
    'Faculty of Art and Education' => [
        'Education English' => ['B. A. (Ed.) Education/English'],
        'Education Islamic Studies' => ['B. A. (Ed.) Education/Islamic Studies'],
        'Education Economics' => ['B.Sc.(Ed.) Education/Economics'],
        'Education Mathematics' => ['B.Sc.(Ed.) Education/Mathematics'],
        'Education Physics' => ['B.Sc.(Ed.) Education/Physics'],
        'Education Computer Science' => ['B.Sc.(Ed.) Education/Computer Science'],
        'Education Chemistry' => ['B.Sc.(Ed.) Education/Chemistry'],
        'Education Biology' => ['B.Sc.(Ed.) Education/Biology'],
        'English Language' => ['B.A. English Language'],
        'Literature in English' => ['B.A. Literature in English'],
        'Islamic Studies' => ['B.A. Islamic Studies']
    ]
];

// 2. SQL GENERATION

echo "-- SQL Dump for KIU EXPLORER Academic Structure\n";
echo "-- Simply Copy and Paste this entire block into the SQL tab in phpMyAdmin\n";
echo "\n";
echo "SET FOREIGN_KEY_CHECKS=0;\n";
echo "\n";

// --- CREATE TABLES ---

echo "-- 1. Create Faculties Table\n";
echo "CREATE TABLE IF NOT EXISTS `faculties` (\n";
echo "  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,\n";
echo "  `name` varchar(255) NOT NULL,\n";
echo "  `code` varchar(255) DEFAULT NULL,\n";
echo "  `description` text DEFAULT NULL,\n";
echo "  `created_at` timestamp NULL DEFAULT NULL,\n";
echo "  `updated_at` timestamp NULL DEFAULT NULL,\n";
echo "  PRIMARY KEY (`id`),\n";
echo "  UNIQUE KEY `faculties_name_unique` (`name`)\n";
echo ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n";
echo "\n";

echo "-- 2. Create Departments Table\n";
echo "CREATE TABLE IF NOT EXISTS `departments` (\n";
echo "  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,\n";
echo "  `faculty_id` bigint(20) unsigned NOT NULL,\n";
echo "  `name` varchar(255) NOT NULL,\n";
echo "  `code` varchar(255) DEFAULT NULL,\n";
echo "  `description` text DEFAULT NULL,\n";
echo "  `created_at` timestamp NULL DEFAULT NULL,\n";
echo "  `updated_at` timestamp NULL DEFAULT NULL,\n";
echo "  PRIMARY KEY (`id`),\n";
echo "  KEY `departments_faculty_id_foreign` (`faculty_id`),\n";
echo "  CONSTRAINT `departments_faculty_id_foreign` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`) ON DELETE CASCADE\n";
echo ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n";
echo "\n";

echo "-- 3. Create Programmes Table\n";
echo "CREATE TABLE IF NOT EXISTS `programmes` (\n";
echo "  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,\n";
echo "  `department_id` bigint(20) unsigned NOT NULL,\n";
echo "  `name` varchar(255) NOT NULL,\n";
echo "  `degree_type` varchar(255) DEFAULT NULL,\n";
echo "  `duration` varchar(255) DEFAULT NULL,\n";
echo "  `description` text DEFAULT NULL,\n";
echo "  `created_at` timestamp NULL DEFAULT NULL,\n";
echo "  `updated_at` timestamp NULL DEFAULT NULL,\n";
echo "  PRIMARY KEY (`id`),\n";
echo "  KEY `programmes_department_id_foreign` (`department_id`),\n";
echo "  CONSTRAINT `programmes_department_id_foreign` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE\n";
echo ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n";
echo "\n";

echo "-- 4. Create Academic Sessions Table\n";
echo "CREATE TABLE IF NOT EXISTS `academic_sessions` (\n";
echo "  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,\n";
echo "  `name` varchar(255) NOT NULL,\n";
echo "  `is_current` tinyint(1) NOT NULL DEFAULT 0,\n";
echo "  `start_date` date DEFAULT NULL,\n";
echo "  `end_date` date DEFAULT NULL,\n";
echo "  `created_at` timestamp NULL DEFAULT NULL,\n";
echo "  `updated_at` timestamp NULL DEFAULT NULL,\n";
echo "  PRIMARY KEY (`id`),\n";
echo "  UNIQUE KEY `academic_sessions_name_unique` (`name`)\n";
echo ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n";
echo "\n";

// --- INSERT DATA ---

$f_id = 1;
$d_id = 1;
$p_id = 1;

foreach ($faculties as $facultyName => $depts) {
    // Insert Faculty
    $safeFacName = addslashes($facultyName);
    echo "INSERT INTO `faculties` (`id`, `name`, `created_at`, `updated_at`) VALUES ($f_id, '$safeFacName', NOW(), NOW());\n";
    $currentFacId = $f_id;
    $f_id++;

    foreach ($depts as $deptName => $progs) {
        $safeDeptName = addslashes($deptName);
        echo "INSERT INTO `departments` (`id`, `faculty_id`, `name`, `created_at`, `updated_at`) VALUES ($d_id, $currentFacId, '$safeDeptName', NOW(), NOW());\n";
        $currentDeptId = $d_id;
        $d_id++;

        foreach ($progs as $progName) {
            $safeProgName = addslashes($progName);
            echo "INSERT INTO `programmes` (`id`, `department_id`, `name`, `created_at`, `updated_at`) VALUES ($p_id, $currentDeptId, '$safeProgName', NOW(), NOW());\n";
            $p_id++;
        }
    }
}

// Insert Session
echo "\n";
echo "INSERT INTO `academic_sessions` (`name`, `is_current`, `created_at`, `updated_at`) VALUES ('2025/2026', 1, NOW(), NOW());\n";
echo "INSERT INTO `academic_sessions` (`name`, `is_current`, `created_at`, `updated_at`) VALUES ('2026/2027', 0, NOW(), NOW());\n";
echo "\n";

echo "SET FOREIGN_KEY_CHECKS=1;\n";
