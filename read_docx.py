import zipfile
import re
import sys

def get_docx_text(path):
    try:
        with zipfile.ZipFile(path) as z:
            xml_content = z.read('word/document.xml').decode('utf-8')
            # Extract text from <w:t> tags
            text = re.sub(r'<w:p[^>]*>', '\n', xml_content)
            text = re.sub(r'<[^>]+>', '', text)
            return text
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        text = get_docx_text(sys.argv[1])
        with open(sys.argv[1] + '.txt', 'w', encoding='utf-8') as f:
            f.write(text)
        print("Success")
