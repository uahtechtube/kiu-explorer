<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Faculties:\n";
$faculties = DB::table('faculties')->select('id', 'name')->get();
foreach ($faculties as $f) {
    echo "ID: {$f->id}, Name: {$f->name}\n";
}

echo "\nDepartments (First 5):\n";
$departments = DB::table('departments')->select('id', 'name', 'faculty_id')->limit(5)->get();
foreach ($departments as $d) {
    echo "ID: {$d->id}, FacID: {$d->faculty_id}, Name: {$d->name}\n";
}

echo "\nProgrammes (First 5):\n";
$programmes = DB::table('programmes')->select('id', 'name', 'department_id')->limit(5)->get();
foreach ($programmes as $p) {
    echo "ID: {$p->id}, DeptID: {$p->department_id}, Name: {$p->name}\n";
}

echo "\nSessions:\n";
$sessions = DB::table('academic_sessions')->select('id', 'name')->get();
foreach ($sessions as $s) {
    echo "ID: {$s->id}, Name: {$s->name}\n";
}
