
import zipfile
import xml.etree.ElementTree as ET
import shutil
import os

def extract_text(docx_path):
    temp_path = "temp_analysis_file.docx"
    shutil.copy2(docx_path, temp_path)
    
    text_content = []
    try:
        with zipfile.ZipFile(temp_path, 'r') as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            # w:t tags contain the actual text
            # Namespace for Word processingML
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            for t_tag in tree.findall('.//w:t', ns):
                if t_tag.text:
                    text_content.append(t_tag.text)
                    
        return " ".join(text_content)
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    path = r"d:\KIU EXPLORER\Product Requirements Document.docx"
    print(extract_text(path))
