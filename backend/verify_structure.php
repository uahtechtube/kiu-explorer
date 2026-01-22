<?php
require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$faculties = DB::table('faculties')->get();
echo "Faculties Count: " . $faculties->count() . "\n";

foreach ($faculties as $faculty) {
    echo "- " . $faculty->name . "\n";
    $depts = DB::table('departments')->where('faculty_id', $faculty->id)->get();
    foreach ($depts as $dept) {
        echo "  * " . $dept->name . "\n";
        $progs = DB::table('programmes')->where('department_id', $dept->id)->get();
        foreach ($progs as $prog) {
            echo "    -> " . $prog->name . "\n";
        }
    }
}
