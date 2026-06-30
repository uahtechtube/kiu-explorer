<?php
$file = 'c:/xampp/htdocs/app/KIU EXPLORER/hotel.docx';
$zip = new ZipArchive();
if ($zip->open($file) === TRUE) {
    $xml = $zip->getFromName('word/document.xml');
    $zip->close();
    
    // Parse text
    $doc = new DOMDocument();
    $doc->loadXML($xml);
    $xpath = new DOMXPath($doc);
    $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');
    $nodes = $xpath->query('//w:t');
    
    $texts = [];
    foreach ($nodes as $node) {
        $texts[] = $node->textContent;
    }
    echo implode(' ', $texts);
} else {
    echo 'Failed to open zip';
}
