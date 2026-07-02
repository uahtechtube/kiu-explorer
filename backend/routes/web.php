<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\LandingPageController;
use App\Http\Controllers\BlogPostController;
use App\Http\Controllers\GalleryController;

// Public Landing Page and Download Routes
Route::get('/', [LandingPageController::class, 'index'])->name('landing');
Route::get('/download-apk/track', [LandingPageController::class, 'trackDownload'])->name('download.track');
Route::get('/download-apk/mock', [LandingPageController::class, 'downloadMockApk'])->name('download.mock');

// Public Blog & Gallery Routes
Route::get('/blog', [BlogPostController::class, 'index'])->name('blog.index');
Route::get('/blog/{slug}', [BlogPostController::class, 'show'])->name('blog.show');
Route::get('/gallery', [GalleryController::class, 'index'])->name('gallery.index');

// Diagnostic Storage Route
Route::match(['get', 'post'], '/check-storage', function (Request $request) {
    $linkPath = public_path('storage');
    $targetPath = storage_path('app/public');

    $fixMessage = '';
    $fixSuccess = null;

    // Action: Clean and recreate symlink
    if ($request->query('action') == 'fix_symlink') {
        try {
            if (file_exists($linkPath) || is_link($linkPath)) {
                if (is_link($linkPath)) {
                    if (PHP_OS_FAMILY === 'Windows') {
                        exec("rmdir " . escapeshellarg($linkPath));
                    } else {
                        unlink($linkPath);
                    }
                } else {
                    rename($linkPath, $linkPath . '_backup_' . time());
                }
            }
            
            \Illuminate\Support\Facades\Artisan::call('storage:link');
            $fixSuccess = true;
            $fixMessage = "Storage link created successfully using Artisan. Output: " . trim(\Illuminate\Support\Facades\Artisan::output());
        } catch (\Throwable $e) {
            try {
                if (symlink($targetPath, $linkPath)) {
                    $fixSuccess = true;
                    $fixMessage = "Storage link created successfully using PHP symlink().";
                } else {
                    $fixSuccess = false;
                    $fixMessage = "Failed to create storage link. error_get_last: " . json_encode(error_get_last());
                }
            } catch (\Throwable $e2) {
                $fixSuccess = false;
                $fixMessage = "Exception creating storage link: " . $e2->getMessage();
            }
        }
    }

    // Action: Clean/Reset Hero Settings (to default)
    if ($request->query('action') == 'reset_hero') {
        try {
            $settings = \App\Models\LandingPageSetting::first();
            if ($settings) {
                $settings->update([
                    'hero_image_path' => null,
                    'hero_video_path' => null
                ]);
                $fixSuccess = true;
                $fixMessage = "Hero media paths reset to NULL in database (restoring default CSS mockup).";
            }
        } catch (\Throwable $e) {
            $fixSuccess = false;
            $fixMessage = "Failed to reset hero settings: " . $e->getMessage();
        }
    }

    // Action: Process native test file upload
    $testUploadResult = '';
    if ($request->hasFile('test_file')) {
        $file = $request->file('test_file');
        $testUploadResult = "<strong>Filename:</strong> " . htmlspecialchars($file->getClientOriginalName()) . "<br>"
                          . "<strong>Mime Type:</strong> " . htmlspecialchars($file->getMimeType()) . "<br>"
                          . "<strong>Size:</strong> " . number_format($file->getSize()) . " bytes<br>";
                          
        try {
            $path = $file->storeAs('test', 'test_upload_verify.txt', 'public');
            if (\Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
                $testUploadResult .= "<br><span style='color:#10b981; font-weight:bold;'>✓ Success! File uploaded successfully via Laravel storage to public/storage/" . htmlspecialchars($path) . "</span>";
                \Illuminate\Support\Facades\Storage::disk('public')->delete($path);
            } else {
                $testUploadResult .= "<br><span style='color:#ef4444; font-weight:bold;'>✗ Verification failed! File was uploaded but could not be detected on disk.</span>";
            }
        } catch (\Throwable $ex) {
            $testUploadResult .= "<br><span style='color:#ef4444; font-weight:bold;'>✗ Exception during upload: " . htmlspecialchars($ex->getMessage()) . "</span>";
        }
    }

    // Gather diagnosis details
    $symlinkExists = file_exists($linkPath);
    $symlinkIsLink = is_link($linkPath);
    $symlinkTarget = '';
    if ($symlinkIsLink) {
        $symlinkTarget = readlink($linkPath);
    }

    $targetExists = file_exists($targetPath);
    $targetWritable = is_writable($targetPath);

    // Database check
    $settings = null;
    $dbError = '';
    try {
        $settings = \App\Models\LandingPageSetting::first();
    } catch (\Throwable $e) {
        $dbError = $e->getMessage();
    }

    // Database Table Schema check (DESCRIBE table)
    $dbSchema = [];
    $schemaError = '';
    try {
        $rawColumns = \Illuminate\Support\Facades\DB::select("DESCRIBE landing_page_settings");
        foreach ($rawColumns as $col) {
            $dbSchema[] = [
                'Field' => $col->Field,
                'Type' => $col->Type,
                'Null' => $col->Null,
                'Key' => $col->Key,
                'Default' => $col->Default,
                'Extra' => $col->Extra
            ];
        }
    } catch (\Throwable $e) {
        $schemaError = $e->getMessage();
    }

    // File check on disk helper
    $checkFileOnDisk = function($path) {
        if (empty($path)) return ['exists' => false, 'label' => 'Empty / Not Set', 'class' => 'status-empty'];
        try {
            $exists = \Illuminate\Support\Facades\Storage::disk('public')->exists($path);
            if ($exists) {
                return ['exists' => true, 'label' => 'Exists on Disk', 'class' => 'status-ok'];
            } else {
                return ['exists' => false, 'label' => 'Missing on Disk', 'class' => 'status-error'];
            }
        } catch (\Throwable $e) {
            return ['exists' => false, 'label' => 'Storage Error: ' . $e->getMessage(), 'class' => 'status-error'];
        }
    };

    $heroImageCheck = $checkFileOnDisk($settings ? $settings->hero_image_path : null);
    $heroVideoCheck = $checkFileOnDisk($settings ? $settings->hero_video_path : null);
    $apkFileCheck = $checkFileOnDisk($settings ? $settings->apk_file_path : null);

    // PHP limits
    $uploadMax = ini_get('upload_max_filesize');
    $postMax = ini_get('post_max_size');
    $memoryLimit = ini_get('memory_limit');
    $tempDir = sys_get_temp_dir();
    $tempWritable = is_writable($tempDir);

    $html = '
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>KIU Explorer - Storage & Symlink Diagnostic Tool</title>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
        <style>
            :root {
                --primary: #09a5db;
                --success: #10b981;
                --error: #ef4444;
                --warning: #f59e0b;
                --bg: #090d16;
                --card: rgba(17, 25, 40, 0.75);
                --border: rgba(255, 255, 255, 0.08);
                --text-primary: #f8fafc;
                --text-secondary: #94a3b8;
            }

            body {
                font-family: \'Plus Jakarta Sans\', sans-serif;
                background-color: var(--bg);
                color: var(--text-primary);
                margin: 0;
                padding: 40px 20px;
                line-height: 1.6;
            }

            .container {
                max-width: 900px;
                margin: 0 auto;
            }

            h1, h2, h3 {
                font-family: \'Outfit\', sans-serif;
                margin-top: 0;
            }

            h1 {
                font-size: 32px;
                font-weight: 800;
                background: linear-gradient(135deg, #fff 50%, var(--primary));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 8px;
            }

            .subtitle {
                color: var(--text-secondary);
                font-size: 16px;
                margin-bottom: 30px;
            }

            .card {
                background: var(--card);
                border: 1px solid var(--border);
                border-radius: 20px;
                padding: 30px;
                backdrop-filter: blur(16px);
                margin-bottom: 25px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }

            .card h2 {
                font-size: 20px;
                border-bottom: 1px solid var(--border);
                padding-bottom: 12px;
                margin-bottom: 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .alert {
                padding: 15px 20px;
                border-radius: 12px;
                margin-bottom: 25px;
                font-weight: 500;
            }

            .alert-success {
                background: rgba(16, 185, 129, 0.15);
                border: 1px solid var(--success);
                color: #d1fae5;
            }

            .alert-danger {
                background: rgba(239, 68, 68, 0.15);
                border: 1px solid var(--error);
                color: #fee2e2;
            }

            .grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }

            @media (max-width: 768px) {
                .grid {
                    grid-template-columns: 1fr;
                }
            }

            .status-badge {
                display: inline-flex;
                align-items: center;
                padding: 4px 10px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
            }

            .status-ok {
                background: rgba(16, 185, 129, 0.15);
                color: #34d399;
                border: 1px solid rgba(16, 185, 129, 0.3);
            }

            .status-error {
                background: rgba(239, 68, 68, 0.15);
                color: #f87171;
                border: 1px solid rgba(239, 68, 68, 0.3);
            }

            .status-empty {
                background: rgba(148, 163, 184, 0.1);
                color: #94a3b8;
                border: 1px solid rgba(148, 163, 184, 0.2);
            }

            .info-row {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            }

            .info-row:last-child {
                border-bottom: none;
            }

            .info-label {
                font-weight: 600;
                color: var(--text-secondary);
            }

            .info-value {
                font-family: monospace;
                word-break: break-all;
                text-align: right;
                max-width: 60%;
            }

            .btn {
                display: inline-block;
                background: var(--primary);
                color: #fff;
                padding: 12px 24px;
                border-radius: 30px;
                text-decoration: none;
                font-weight: 700;
                font-size: 14px;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
                box-shadow: 0 4px 15px rgba(9, 165, 219, 0.3);
            }

            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(9, 165, 219, 0.5);
            }

            .btn-success {
                background: var(--success);
                box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
            }

            .btn-success:hover {
                box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
            }

            .btn-warning {
                background: var(--warning);
                box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
            }

            .btn-warning:hover {
                box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
            }

            .actions-bar {
                display: flex;
                gap: 15px;
                margin-top: 20px;
            }

            .team-list {
                margin-top: 15px;
                border: 1px solid var(--border);
                border-radius: 12px;
                overflow: hidden;
            }

            .team-header {
                background: rgba(255, 255, 255, 0.03);
                font-weight: 700;
                display: grid;
                grid-template-columns: 1fr 1.5fr 1fr;
                padding: 10px 15px;
                border-bottom: 1px solid var(--border);
            }

            .team-item {
                display: grid;
                grid-template-columns: 1fr 1.5fr 1fr;
                padding: 12px 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                align-items: center;
            }

            .team-item:last-child {
                border-bottom: none;
            }

            table.schema-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
                font-family: monospace;
                font-size: 13px;
            }

            table.schema-table th, table.schema-table td {
                border: 1px solid var(--border);
                padding: 10px;
                text-align: left;
            }

            table.schema-table th {
                background: rgba(255,255,255,0.03);
                color: var(--text-secondary);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>KIU Explorer Storage & Symlink Diagnostic</h1>
            <div class="subtitle">Use this tool to analyze and fix file loading issues on your hosted server.</div>';

            if ($fixSuccess === true) {
                $html .= '<div class="alert alert-success"><strong>Success!</strong> ' . htmlspecialchars($fixMessage) . '</div>';
            } elseif ($fixSuccess === false) {
                $html .= '<div class="alert alert-danger"><strong>Failure!</strong> ' . htmlspecialchars($fixMessage) . '</div>';
            }

            if ($dbError) {
                $html .= '<div class="alert alert-danger"><strong>Database Error:</strong> ' . htmlspecialchars($dbError) . '</div>';
            }

            $html .= '
            <div class="grid">
                <!-- Part 1: Symlink and Folder Status -->
                <div class="card">
                    <h2>Symlink Status</h2>
                    <div class="info-row">
                        <span class="info-label">Link Path (/public/storage)</span>
                        <span class="info-value">' . htmlspecialchars($linkPath) . '</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Link Exists?</span>
                        <span class="info-value">
                            ' . ($symlinkExists ? '<span class="status-badge status-ok">YES</span>' : '<span class="status-badge status-error">NO (Broken/Missing)</span>') . '
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Is Symbolic Link?</span>
                        <span class="info-value">
                            ' . ($symlinkIsLink ? '<span class="status-badge status-ok">YES</span>' : '<span class="status-badge status-error">NO (Might be a physical folder or missing)</span>') . '
                        </span>
                    </div>';
                    
                    if ($symlinkIsLink) {
                        $html .= '
                        <div class="info-row">
                            <span class="info-label">Link Points To</span>
                            <span class="info-value">' . htmlspecialchars($symlinkTarget) . '</span>
                        </div>';
                    }

                    $html .= '
                    <h3 style="margin-top: 25px; font-size: 16px;">Target Directory (Storage folder)</h3>
                    <div class="info-row">
                        <span class="info-label">Target Path</span>
                        <span class="info-value">' . htmlspecialchars($targetPath) . '</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Target Exists?</span>
                        <span class="info-value">
                            ' . ($targetExists ? '<span class="status-badge status-ok">YES</span>' : '<span class="status-badge status-error">NO (Upload directory missing!)</span>') . '
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Target Writable?</span>
                        <span class="info-value">
                            ' . ($targetWritable ? '<span class="status-badge status-ok">YES</span>' : '<span class="status-badge status-error">NO (Permission denied)</span>') . '
                        </span>
                    </div>

                    <div class="actions-bar">
                        <a href="?action=fix_symlink" class="btn btn-success">Create/Recreate Storage Link</a>
                    </div>
                </div>

                <!-- Part 2: Database Settings and File Check -->
                <div class="card">
                    <h2>DB Configured Files</h2>';
                    
                    if ($settings) {
                        $html .= '
                        <div class="info-row">
                            <span class="info-label">Hero Mockup Photo</span>
                            <span class="info-value" style="font-weight:bold; color:var(--primary);">' . htmlspecialchars($settings->hero_image_path ?? 'None') . '</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Hero Photo Status</span>
                            <span class="info-value">
                                <span class="status-badge ' . $heroImageCheck['class'] . '">' . $heroImageCheck['label'] . '</span>
                            </span>
                        </div>
                        
                        <div class="info-row">
                            <span class="info-label">Hero Mockup Video</span>
                            <span class="info-value" style="font-weight:bold; color:var(--primary);">' . htmlspecialchars($settings->hero_video_path ?? 'None') . '</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Hero Video Status</span>
                            <span class="info-value">
                                <span class="status-badge ' . $heroVideoCheck['class'] . '">' . $heroVideoCheck['label'] . '</span>
                            </span>
                        </div>

                        <div class="info-row">
                            <span class="info-label">Uploaded APK File</span>
                            <span class="info-value" style="font-size: 12px;">' . htmlspecialchars($settings->apk_file_path ?? 'None') . '</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">APK Status</span>
                            <span class="info-value">
                                <span class="status-badge ' . $apkFileCheck['class'] . '">' . $apkFileCheck['label'] . '</span>
                            </span>
                        </div>

                        <div class="actions-bar">
                            <a href="?action=reset_hero" class="btn btn-warning" onclick="return confirm(\'This will clear the DB mockup paths and show the default interactive CSS mockup. Continue?\')">Reset Hero Config</a>
                        </div>';
                    } else {
                        $html .= '<div style="color: var(--error); font-weight: 700; text-align: center; padding: 20px;">No database settings found!</div>';
                    }
                    
                $html .= '
                </div>
            </div>

            <!-- Database Schema Inspector -->
            <div class="card">
                <h2>Live Database Schema: landing_page_settings</h2>
                <div class="subtitle" style="margin-bottom: 10px;">Check the column type of `hero_image_path` below. It must be <strong>varchar(255)</strong>. If it is <strong>int</strong> or <strong>tinyint</strong>, database updates will cast filenames to 0.</div>';
                
                if ($schemaError) {
                    $html .= '<div style="color:var(--error); font-weight:bold;">Error fetching schema: ' . htmlspecialchars($schemaError) . '</div>';
                } else {
                    $html .= '
                    <table class="schema-table">
                        <thead>
                            <tr>
                                <th>Field</th>
                                <th>Type</th>
                                <th>Null</th>
                                <th>Default</th>
                            </tr>
                        </thead>
                        <tbody>';
                            foreach ($dbSchema as $col) {
                                $style = in_array($col['Field'], ['hero_image_path', 'hero_video_path']) ? 'background:rgba(9, 165, 219, 0.15); font-weight:bold;' : '';
                                $html .= '
                                <tr style="' . $style . '">
                                    <td>' . htmlspecialchars($col['Field']) . '</td>
                                    <td>' . htmlspecialchars($col['Type']) . '</td>
                                    <td>' . htmlspecialchars($col['Null']) . '</td>
                                    <td>' . htmlspecialchars($col['Default'] ?? 'NULL') . '</td>
                                </tr>';
                            }
                        $html .= '
                        </tbody>
                    </table>';
                }
                
            $html .= '
            </div>

            <!-- PHP Native File Upload Tester -->
            <div class="card">
                <h2>PHP Native File Upload Tester</h2>
                <div class="subtitle" style="margin-bottom: 15px;">Upload a small image file here to test if the PHP server is successfully receiving and saving file uploads. This bypasses Laravel validation completely to isolate permission or temp folder issues.</div>
                
                <form action="" method="POST" enctype="multipart/form-data" style="background: rgba(255,255,255,0.02); padding: 20px; border-radius: 12px; border: 1px solid var(--border);">
                    ' . csrf_field() . '
                    <div style="display:flex; flex-direction:column; gap:15px;">
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:600;">Choose file to upload</label>
                            <input type="file" name="test_file" style="background:transparent; color:#fff; border:1px solid var(--border); padding:10px; border-radius:8px; width:100%; box-sizing:border-box;">
                        </div>
                        <div>
                            <button type="submit" class="btn btn-success">Run Upload Test</button>
                        </div>
                    </div>
                </form>';

                if ($testUploadResult) {
                    $html .= '
                    <div style="margin-top:20px; background:rgba(0,0,0,0.3); padding:15px; border-radius:8px; border-left:4px solid var(--primary); font-family:monospace; font-size:13px; line-height:1.7;">
                        ' . $testUploadResult . '
                    </div>';
                }
                
            $html .= '
            </div>

            <!-- Environment Configuration -->
            <div class="card">
                <h2>PHP Environment & Upload Configuration</h2>
                <div class="info-row">
                    <span class="info-label">Laravel APP_URL</span>
                    <span class="info-value">' . htmlspecialchars(config('app.url')) . '</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Current Request Domain</span>
                    <span class="info-value">' . htmlspecialchars($_SERVER['HTTP_HOST'] ?? 'unknown') . '</span>
                </div>
                <div class="info-row">
                    <span class="info-label">PHP Temp Directory</span>
                    <span class="info-value">' . htmlspecialchars($tempDir) . '</span>
                </div>
                <div class="info-row">
                    <span class="info-label">PHP Temp Directory Writable?</span>
                    <span class="info-value">
                        ' . ($tempWritable ? '<span class="status-badge status-ok">YES</span>' : '<span class="status-badge status-error">NO (PHP Uploads will fail!)</span>') . '
                    </span>
                </div>
                <div class="info-row">
                    <span class="info-label">PHP upload_max_filesize</span>
                    <span class="info-value">' . htmlspecialchars($uploadMax) . '</span>
                </div>
                <div class="info-row">
                    <span class="info-label">PHP post_max_size</span>
                    <span class="info-value">' . htmlspecialchars($postMax) . '</span>
                </div>
                <div class="info-row">
                    <span class="info-label">PHP memory_limit</span>
                    <span class="info-value">' . htmlspecialchars($memoryLimit) . '</span>
                </div>
            </div>

            <!-- Team Member Photos check -->
            <div class="card">
                <h2>Team Members\' Uploaded Photos Check</h2>';
                
                if ($settings && !empty($settings->team)) {
                    $html .= '
                    <div class="team-list">
                        <div class="team-header">
                            <span>Name</span>
                            <span>Photo Path</span>
                            <span style="text-align: right;">Status</span>
                        </div>';
                        foreach ($settings->team as $member) {
                            $memberCheck = $checkFileOnDisk($member['photo_path'] ?? null);
                            $html .= '
                            <div class="team-item">
                                <span style="font-weight: 600;">' . htmlspecialchars($member['name']) . '</span>
                                <span style="font-family: monospace; font-size: 12px;">' . htmlspecialchars($member['photo_path'] ?? 'Not set') . '</span>
                                <span style="text-align: right;">
                                    <span class="status-badge ' . $memberCheck['class'] . '">' . $memberCheck['label'] . '</span>
                                </span>
                            </div>';
                        }
                    $html .= '
                    </div>';
                } else {
                    $html .= '<div style="color: var(--text-secondary); text-align: center; padding: 20px;">No team members found in the landing page settings.</div>';
                }
                
            $html .= '
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="' . route('landing') . '" class="btn">Return to Landing Page</a>
            </div>
        </div>
    </body>
    </html>';

    return response($html);
});

// CMS Authentication and Dashboard Routes
Route::get('/cms/login', [LandingPageController::class, 'cmsLoginView'])->name('cms.login');
Route::post('/cms/login', [LandingPageController::class, 'cmsLogin']);
Route::get('/cms/dashboard', [LandingPageController::class, 'cmsDashboard'])->name('cms.dashboard');
Route::post('/cms/settings/update', [LandingPageController::class, 'cmsUpdate'])->name('cms.update');
Route::post('/cms/profile/password', [LandingPageController::class, 'cmsUpdatePassword'])->name('cms.password.update');
Route::post('/cms/admins/create', [LandingPageController::class, 'cmsCreateAdmin'])->name('cms.admin.create');
Route::post('/cms/logout', [LandingPageController::class, 'cmsLogout'])->name('cms.logout');

// CMS Blog Management Routes
Route::post('/cms/blog', [BlogPostController::class, 'store'])->name('cms.blog.store');
Route::post('/cms/blog/{id}/update', [BlogPostController::class, 'update'])->name('cms.blog.update');
Route::post('/cms/blog/{id}/delete', [BlogPostController::class, 'destroy'])->name('cms.blog.destroy');

// CMS Gallery Management Routes
Route::post('/cms/gallery', [GalleryController::class, 'store'])->name('cms.gallery.store');
Route::post('/cms/gallery/{id}/delete', [GalleryController::class, 'destroy'])->name('cms.gallery.destroy');

// Paystack Sandbox Checkout Simulator Page
Route::get('/payments/gateway', function (Request $request) {
    $reference = $request->query('ref');
    $redirectUrl = $request->query('redirect_url');
    $payment = \App\Models\Payment::where('reference', $reference)->firstOrFail();
    
    return "
    <!DOCTYPE html>
    <html>
    <head>
        <title>Paystack Sandbox Simulator</title>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background: #f8fafc;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
            }
            .card {
                background: white;
                border-radius: 24px;
                padding: 40px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
                max-width: 400px;
                width: 90%;
                text-align: center;
                border: 1px solid #f1f5f9;
            }
            .logo {
                color: #09a5db;
                font-size: 28px;
                font-weight: 800;
                margin-bottom: 24px;
            }
            .amount {
                font-size: 36px;
                font-weight: 800;
                color: #0f172a;
                margin-bottom: 8px;
            }
            .ref {
                color: #64748b;
                font-size: 14px;
                margin-bottom: 32px;
            }
            .btn {
                display: block;
                width: 100%;
                padding: 16px;
                border-radius: 16px;
                font-size: 16px;
                font-weight: 700;
                border: none;
                cursor: pointer;
                transition: all 0.2s;
                box-sizing: border-box;
                text-decoration: none;
            }
            .btn-success {
                background: #09a5db;
                color: white;
                margin-bottom: 12px;
                box-shadow: 0 4px 12px rgba(9, 165, 219, 0.2);
            }
            .btn-success:hover {
                background: #078cb8;
            }
            .btn-cancel {
                background: #f1f5f9;
                color: #64748b;
                text-align: center;
                line-height: 16px;
            }
            .btn-cancel:hover {
                background: #e2e8f0;
            }
        </style>
    </head>
    <body>
        <div class='card'>
            <div class='logo'>paystack <span style='font-size:12px; font-weight:bold; color:#64748b; border:1px solid #cbd5e1; padding:2px 6px; border-radius:6px; vertical-align:middle; margin-left:4px;'>SANDBOX</span></div>
            <div style='color: #64748b; font-size: 14px; margin-bottom: 8px; font-weight: 600; text-transform: uppercase;'>Hostel Accommodation Fee</div>
            <div class='amount'>₦" . number_format($payment->amount, 2) . "</div>
            <div class='ref'>Ref: {$reference}</div>
            
            <form action='" . url('/payments/gateway/complete') . "' method='POST'>
                " . csrf_field() . "
                <input type='hidden' name='reference' value='{$reference}'>
                <input type='hidden' name='redirect_url' value='{$redirectUrl}'>
                <button type='submit' class='btn btn-success'>Authorize Successful Payment</button>
            </form>
            <br>
            <a href='{$redirectUrl}' class='btn btn-cancel'>Decline & Cancel</a>
        </div>
    </body>
    </html>
    ";
});

// Paystack Sandbox Simulator Completion
Route::post('/payments/gateway/complete', function (Request $request) {
    $reference = $request->input('reference');
    $redirectUrl = $request->input('redirect_url');
    
    $payment = \App\Models\Payment::where('reference', $reference)->firstOrFail();
    $payment->update([
        'status' => 'paid',
        'transaction_date' => now(),
        'payment_method' => 'card',
    ]);
    
    // Auto-approve hostel booking on successful payment completion (with self-healing bed allocation)
    if ($payment->type === 'hostel') {
        $booking = \App\Models\HostelBooking::where('payment_id', $payment->id)->first();
        if ($booking && $booking->status === 'pending') {
            $room = $booking->room;
            if ($room && $room->available_slots > 0) {
                $booking->update([
                    'status' => 'approved',
                    'approved_at' => now(),
                ]);
                
                $bed = $room->beds()->where('is_occupied', false)->first();
                if ($bed) {
                    $bed->update([
                        'is_occupied' => true,
                        'student_id' => $booking->student_id,
                    ]);
                } else {
                    // Self-healing fallback: create bed dynamically if none exists
                    $room->beds()->create([
                        'bed_number' => 'Bed ' . ($room->capacity - $room->available_slots + 1),
                        'is_occupied' => true,
                        'student_id' => $booking->student_id,
                    ]);
                }
                
                $room->decrement('available_slots');
                if ($room->available_slots === 0) {
                    $room->update(['status' => 'full']);
                }
            }
        }
    }
    
    return "
    <!DOCTYPE html>
    <html>
    <head>
        <title>Payment Successful</title>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background: #f8fafc;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
            }
            .card {
                background: white;
                border-radius: 24px;
                padding: 40px;
                box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
                max-width: 400px;
                width: 90%;
                text-align: center;
                border: 1px solid #f1f5f9;
            }
            .icon {
                color: #10b981;
                font-size: 64px;
                margin-bottom: 24px;
            }
            h1 {
                font-size: 24px;
                font-weight: 800;
                color: #0f172a;
                margin: 0 0 12px 0;
            }
            p {
                color: #64748b;
                font-size: 15px;
                line-height: 1.6;
                margin: 0 0 32px 0;
            }
            .btn {
                display: block;
                width: 100%;
                padding: 16px;
                border-radius: 16px;
                font-size: 16px;
                font-weight: 700;
                text-align: center;
                background: #10b981;
                color: white;
                border: none;
                cursor: pointer;
                text-decoration: none;
                box-sizing: border-box;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
            }
            .btn:hover {
                background: #059669;
            }
        </style>
    </head>
    <body>
        <div class='card'>
            <div class='icon'>✓</div>
            <h1>Payment Successful!</h1>
            <p>Your payment of ₦" . number_format($payment->amount, 2) . " has been successfully authorized. Your hostel booking is now approved and room bed is allocated!</p>
            <p style='color:#94a3b8; font-size:12px; margin-top:-16px; margin-bottom:24px;'>Redirecting back to the app in 2 seconds...</p>
            <a href='{$redirectUrl}' class='btn'>Return to App</a>
        </div>
        
        <script>
            // Automatically redirect back to Expo App
            setTimeout(function() {
                var url = '{$redirectUrl}';
                if (url && url !== '#') {
                    window.location.href = url;
                }
            }, 2000);
        </script>
    </body>
    </html>
    ";
});

// Printable Payment Receipt Web View
Route::get('/payments/{reference}/receipt', [\App\Http\Controllers\PaymentController::class, 'downloadReceiptWeb']);
