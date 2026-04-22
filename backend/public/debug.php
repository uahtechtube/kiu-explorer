<?php
$file = '../storage/logs/laravel.log';
$size = filesize($file);
$f = fopen($file, 'r');
fseek($f, max(0, $size - 10000));
$content = fread($f, 10000);
fclose($f);
file_put_contents('last_error.txt', $content);
echo "Written!";
