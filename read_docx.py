import zipfile
import xml.etree.ElementTree as ET

path = r'c:/xampp/htdocs/app/KIU EXPLORER/hotel.docx'
z = zipfile.ZipFile(path)
s = z.read('word/document.xml')
root = ET.fromstring(s)
ns = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'
texts = [t.text for t in root.iter(ns) if t.text]
content = ' '.join(texts)
print(content[:10000])
