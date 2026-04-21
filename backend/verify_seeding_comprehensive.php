<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;
use App\Models\Post;
use App\Models\Event;
use App\Models\LibraryResource;

echo "--- Seeding Verification ---\n\n";

echo "Users Summary:\n";
$users = User::select('id', 'surname', 'first_name', 'email', 'role')->get();
foreach ($users as $u) {
    echo "- [{$u->role}] {$u->surname} {$u->first_name} ({$u->email})\n";
}

echo "\nSocial Posts Summary:\n";
$posts = Post::with('user:id,surname,first_name')->get();
foreach ($posts as $p) {
    echo "- By {$p->user->first_name}: " . substr($p->content, 0, 50) . "...\n";
}

echo "\nEvents Summary:\n";
$events = Event::select('id', 'title', 'venue', 'category', 'status')->get();
foreach ($events as $e) {
    echo "- [{$e->category}] {$e->title} @ {$e->venue} ({$e->status})\n";
}

echo "\nLibrary Resources Summary:\n";
$resources = LibraryResource::select('id', 'title', 'category', 'is_approved')->get();
foreach ($resources as $r) {
    echo "- [{$r->category}] {$r->title} (Approved: " . ($r->is_approved ? 'Yes' : 'No') . ")\n";
}
?>
