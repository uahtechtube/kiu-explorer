<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademicStructureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Clear existing data to prevent duplicates
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('programmes')->truncate();
        DB::table('departments')->truncate();
        DB::table('faculties')->truncate();
        DB::table('academic_sessions')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 2. Define the Academic Structure Hierarchy (Source: List 2)
        $faculties = [
            'Faculty of Basic Medical and Allied Health Science' => [
                'Medicine and Surgery' => [
                    'M.B.B.S Medicine and Surgery'
                ],
                'Nursing Science' => [
                    'B.NSC. Nursing Science'
                ],
                'Physiotherapy' => [
                    'D. PT Physiotherapy'
                ],
                'Radiography' => [
                    'B.Sc. Radiography' // Inferred from 'ND/HND Radiography' -> B.Sc. Degree requirement text
                ],
                'Medical Laboratory Science' => [
                    'B.MLS. Medical Laboratory Science'
                ],
                'Health Information Management' => [
                    'B.Sc. Health Information Management'
                ]
            ],
            'Faculty of Agriculture' => [
                'Agriculture' => [
                    'B. Agriculture'
                ]
            ],
            'Faculty of Science' => [
                'Animal and Environmental Biology' => [
                    'B. Sc. Animal & Environmental Biology'
                ],
                'Biotechnology' => [
                    'B.Sc Biotechnology'
                ],
                'Plant Science and Biotechnology' => [
                    'B. Sc. Plant Science & Biotechnology'
                ],
                'Computer Science' => [
                    'B. Sc. Computer Science'
                ],
                'Mathematics' => [
                    'B. Sc. Mathematics'
                ],
                'Statistics' => [
                    'B. Sc. Statistics'
                ],
                'Chemistry' => [
                    'B. Sc. Chemistry'
                ],
                'Physics' => [
                    'B. Sc. Physics'
                ],
                'Biochemistry' => [
                    'B.SC. Biochemistry'
                ]
            ],
            'Faculty of Social & Management Sciences' => [
                'Accounting' => [
                    'B. Sc. Accounting'
                ],
                'Business Administration' => [
                    'B. Sc. Business Administration'
                ],
                'Economics' => [
                    'B. Sc. Economics'
                ],
                'Criminology and Security Studies' => [
                    'B. Sc. Criminology and Security Studies'
                ],
                'Geography' => [
                    'B. Sc. Geography'
                ],
                'Mass Communication' => [
                    'B. Sc. Mass Communication'
                ],
                'Public Administration' => [
                    'B Sc. Public Administration'
                ],
                'Political Science' => [
                    'B. Sc. Political Science'
                ],
                'Peace Studies and Conflict Resolution' => [
                    'B. Sc. Peace Studies & Conflict Resolution'
                ],
                'Sociology' => [
                    'B. Sc. Sociology'
                ]
            ],
            'Faculty of Art and Education' => [
                'Education English' => [ // Maps to 'Education English' header
                    'B. A. (Ed.) Education/English' // Inferred standard title
                ],
                'Education Islamic Studies' => [
                    'B. A. (Ed.) Education/Islamic Studies'
                ],
                'Education Economics' => [
                    'B.Sc.(Ed.) Education/Economics'
                ],
                'Education Mathematics' => [
                    'B.Sc.(Ed.) Education/Mathematics'
                ],
                'Education Physics' => [
                    'B.Sc.(Ed.) Education/Physics'
                ],
                'Education Computer Science' => [
                    'B.Sc.(Ed.) Education/Computer Science'
                ],
                'Education Chemistry' => [
                    'B.Sc.(Ed.) Education/Chemistry'
                ],
                'Education Biology' => [
                    'B.Sc.(Ed.) Education/Biology'
                ],
                'English Language' => [
                    'B.A. English Language'
                ],
                'Literature in English' => [
                    'B.A. Literature in English'
                ],
                'Islamic Studies' => [
                    'B.A. Islamic Studies'
                ]
            ]
        ];

        // 3. Insert Data
        foreach ($faculties as $facultyName => $departments) {
            $facultyId = DB::table('faculties')->insertGetId([
                'name' => $facultyName,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($departments as $deptName => $programmes) {
                $deptId = DB::table('departments')->insertGetId([
                    'faculty_id' => $facultyId,
                    'name' => $deptName,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                foreach ($programmes as $progName) {
                    DB::table('programmes')->insert([
                        'department_id' => $deptId,
                        'name' => $progName,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        // 4. Seed Academic Sessions
        DB::table('academic_sessions')->insert([
            ['name' => '2025/2026', 'is_current' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => '2026/2027', 'is_current' => false, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
