<?php
require __DIR__ . '/vendor/autoload.php';

if (class_exists('Illuminate\Database\Migrations\Migration')) {
    echo "Migration class found successfully.\n";
} else {
    echo "Error: Migration class NOT found.\n";
}
