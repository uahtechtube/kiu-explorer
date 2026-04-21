<?php
echo "Running MasterSeeder...\n";
$output = shell_exec('php artisan db:seed --class=MasterSeeder 2>&1');
echo $output;
?>
