<?php
$zip = new ZipArchive;
$file = '../../hotel.docx';
$res = $zip->open($file);
if ($res === TRUE) {
    if(($index = $zip->locateName('word/document.xml')) !== false) {
        $data = $zip->getFromIndex($index);
        $zip->close();
        
        // Better XML parsing to retain paragraph breaks
        $data = str_replace(['<w:p>', '<w:p '], "\n<w:p>", $data);
        $text = strip_tags($data);
        
        header('Content-Type: text/plain');
        echo html_entity_decode($text, ENT_QUOTES, 'UTF-8');
    } else {
        echo "Could not find word/document.xml";
    }
} else {
    echo "Could not open $file";
}
