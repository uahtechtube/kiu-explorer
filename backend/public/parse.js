const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

function extractText(filePath) {
    try {
        const zip = new AdmZip(filePath);
        const zipEntries = zip.getEntries();
        const docEntry = zipEntries.find(entry => entry.entryName === 'word/document.xml');
        
        if (!docEntry) {
            console.log('word/document.xml not found in docx');
            return;
        }
        
        let xmlData = docEntry.getData().toString('utf8');
        xmlData = xmlData.replace(/<w:p[^>]*>/g, '\n');
        const text = xmlData.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        console.log(text);
    } catch (e) {
        console.error('Error:', e);
    }
}

extractText(path.join(__dirname, '../../hotel.docx'));
