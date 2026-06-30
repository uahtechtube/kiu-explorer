const fs = require('fs');

// Read the docx (which is a ZIP file)
const data = fs.readFileSync('C:/xampp/htdocs/app/KIU EXPLORER/hotel.docx');

// Find the word/document.xml using manual ZIP parsing
// A ZIP file's local file headers start with PK\x03\x04
let pos = 0;
const buf = data;

function findFile(name) {
    const nameBytes = Buffer.from(name);
    for (let i = 0; i < buf.length - 30; i++) {
        if (buf[i] === 0x50 && buf[i + 1] === 0x4B && buf[i + 2] === 0x03 && buf[i + 3] === 0x04) {
            const nameLen = buf.readUInt16LE(i + 26);
            const extraLen = buf.readUInt16LE(i + 28);
            const fileNameBuf = buf.slice(i + 30, i + 30 + nameLen);
            const fileName = fileNameBuf.toString('utf8');
            if (fileName === name) {
                const compressedSize = buf.readUInt32LE(i + 18);
                const dataStart = i + 30 + nameLen + extraLen;
                return { dataStart, compressedSize };
            }
        }
    }
    return null;
}

const entry = findFile('word/document.xml');
if (entry) {
    const zlib = require('zlib');
    const compressed = buf.slice(entry.dataStart, entry.dataStart + entry.compressedSize);
    try {
        const decompressed = zlib.inflateRawSync(compressed);
        const xmlStr = decompressed.toString('utf8');
        // Extract text nodes
        const matches = xmlStr.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
        const texts = matches.map(m => m.replace(/<[^>]+>/g, ''));
        console.log(texts.join(' ').substring(0, 12000));
    } catch (e) {
        // Not compressed, raw
        const xmlStr = buf.slice(entry.dataStart, entry.dataStart + entry.compressedSize).toString('utf8');
        const matches = xmlStr.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
        const texts = matches.map(m => m.replace(/<[^>]+>/g, ''));
        console.log(texts.join(' ').substring(0, 12000));
    }
} else {
    console.log('Entry not found');
}
