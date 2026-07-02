<?php
// Standalone PHP Upload Tester (No Laravel dependencies)
error_reporting(E_ALL);
ini_set('display_errors', 1);

$linkPath = __DIR__ . '/storage';
$targetPath = __DIR__ . '/../storage/app/public';
$imagesPath = $targetPath . '/images';

$result = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_FILES['test_file'])) {
        $file = $_FILES['test_file'];
        $result = "<strong>Filename:</strong> " . htmlspecialchars($file['name']) . "<br>"
                . "<strong>Type:</strong> " . htmlspecialchars($file['type']) . "<br>"
                . "<strong>Temp Location:</strong> " . htmlspecialchars($file['tmp_name'] ?: 'none') . "<br>"
                . "<strong>Error Code:</strong> " . $file['error'] . " (" . getUploadErrorName($file['error']) . ")<br>"
                . "<strong>Size:</strong> " . number_format($file['size']) . " bytes<br><br>";
                
        if ($file['error'] === UPLOAD_ERR_OK) {
            // Test 1: Write to public/ folder
            $destPublic = __DIR__ . '/test_upload_public.txt';
            if (copy($file['tmp_name'], $destPublic)) {
                $result .= "<span style='color:green; font-weight:bold;'>✓ Test 1 Passed: Wrote successfully to public/ folder.</span><br>";
                unlink($destPublic);
            } else {
                $result .= "<span style='color:red; font-weight:bold;'>✗ Test 1 Failed: Cannot write to public/ folder.</span><br>";
            }

            // Test 2: Write to storage/app/public/
            $destStorage = $targetPath . '/test_upload_storage.txt';
            try {
                if (!file_exists($targetPath)) {
                    $result .= "<span style='color:red; font-weight:bold;'>✗ Test 2 Failed: Target storage folder does not exist at " . htmlspecialchars($targetPath) . "</span><br>";
                } else if (copy($file['tmp_name'], $destStorage)) {
                    $result .= "<span style='color:green; font-weight:bold;'>✓ Test 2 Passed: Wrote successfully to storage/app/public/.</span><br>";
                    unlink($destStorage);
                } else {
                    $result .= "<span style='color:red; font-weight:bold;'>✗ Test 2 Failed: Cannot write to storage/app/public/. Permission Denied.</span><br>";
                }
            } catch (\Throwable $e) {
                $result .= "<span style='color:red; font-weight:bold;'>✗ Test 2 Failed: Exception: " . htmlspecialchars($e->getMessage()) . "</span><br>";
            }

            // Test 3: Write to storage/app/public/images/
            $destImages = $imagesPath . '/test_upload_images.txt';
            try {
                if (!file_exists($imagesPath)) {
                    // Try to create it
                    if (mkdir($imagesPath, 0755, true)) {
                        $result .= "<span style='color:green; font-weight:bold;'>✓ Created images folder successfully.</span><br>";
                    } else {
                        $result .= "<span style='color:red; font-weight:bold;'>✗ Failed to create images folder under storage/app/public/.</span><br>";
                    }
                }
                
                if (file_exists($imagesPath)) {
                    if (copy($file['tmp_name'], $destImages)) {
                        $result .= "<span style='color:green; font-weight:bold;'>✓ Test 3 Passed: Wrote successfully to storage/app/public/images/.</span><br>";
                        unlink($destImages);
                    } else {
                        $result .= "<span style='color:red; font-weight:bold;'>✗ Test 3 Failed: Cannot write to storage/app/public/images/. Permission Denied.</span><br>";
                    }
                } else {
                    $result .= "<span style='color:red; font-weight:bold;'>✗ Test 3 Failed: images/ folder does not exist.</span><br>";
                }
            } catch (\Throwable $e) {
                $result .= "<span style='color:red; font-weight:bold;'>✗ Test 3 Failed: Exception: " . htmlspecialchars($e->getMessage()) . "</span><br>";
            }
        }
    } else {
        $result = "No file received in request.";
    }
}

function getUploadErrorName($code) {
    switch ($code) {
        case UPLOAD_ERR_OK: return 'UPLOAD_ERR_OK';
        case UPLOAD_ERR_INI_SIZE: return 'UPLOAD_ERR_INI_SIZE';
        case UPLOAD_ERR_FORM_SIZE: return 'UPLOAD_ERR_FORM_SIZE';
        case UPLOAD_ERR_PARTIAL: return 'UPLOAD_ERR_PARTIAL';
        case UPLOAD_ERR_NO_FILE: return 'UPLOAD_ERR_NO_FILE';
        case UPLOAD_ERR_NO_TMP_DIR: return 'UPLOAD_ERR_NO_TMP_DIR';
        case UPLOAD_ERR_CANT_WRITE: return 'UPLOAD_ERR_CANT_WRITE';
        case UPLOAD_ERR_EXTENSION: return 'UPLOAD_ERR_EXTENSION';
        default: return 'Unknown Error';
    }
}

$uploadMax = ini_get('upload_max_filesize');
$postMax = ini_get('post_max_size');
$tempDir = sys_get_temp_dir();
$tempWritable = is_writable($tempDir);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Standalone PHP File Upload Tester</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #090d16;
            color: #f8fafc;
            padding: 40px 20px;
            display: flex;
            justify-content: center;
        }
        .card {
            background: rgba(17, 25, 40, 0.75);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            padding: 30px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        h2 { margin-top: 0; }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            font-size: 14px;
        }
        .btn {
            background: #10b981;
            color: #fff;
            padding: 10px 20px;
            border-radius: 30px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            width: 100%;
            margin-top: 15px;
        }
        .result-box {
            margin-top: 20px;
            background: rgba(0,0,0,0.3);
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 13px;
            border-left: 4px solid #09a5db;
            line-height: 1.8;
        }
    </style>
</head>
<body>
    <div class="card">
        <h2>PHP Upload Tester</h2>
        <p style="color:#94a3b8; font-size:14px;">Bypasses Laravel and CSRF. Upload a file to test server compatibility.</p>
        
        <div class="info-row">
            <span>PHP Temp Dir</span>
            <span><?php echo htmlspecialchars($tempDir); ?> (Writable: <?php echo $tempWritable ? 'YES' : 'NO'; ?>)</span>
        </div>
        <div class="info-row">
            <span>upload_max_filesize</span>
            <span><?php echo htmlspecialchars($uploadMax); ?></span>
        </div>
        <div class="info-row">
            <span>post_max_size</span>
            <span><?php echo htmlspecialchars($postMax); ?></span>
        </div>

        <form action="" method="POST" enctype="multipart/form-data" style="margin-top:20px;">
            <input type="file" name="test_file" required style="border:1px solid rgba(255,255,255,0.08); padding:10px; width:100%; box-sizing:border-box; border-radius:8px; color:#fff;">
            <button type="submit" class="btn">Test Server Upload</button>
        </form>

        <?php if ($result): ?>
            <div class="result-box">
                <?php echo $result; ?>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
