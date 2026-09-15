import json
import re

with open('db.json', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
in_conflict = False
section = None
head_content = []
feature_content = []

for line in lines:
    if line.startswith('<<<<<<<'):
        in_conflict = True
        section = 'HEAD'
        head_content = []
        feature_content = []
    elif line.startswith('======='):
        section = 'FEATURE'
    elif line.startswith('>>>>>>>'):
        in_conflict = False
        # Combine head_content and feature_content
        head_str = "".join(head_content).strip()
        feature_str = "".join(feature_content).strip()
        
        parts = []
        if head_str:
            parts.append(head_str)
        if feature_str:
            parts.append(feature_str)
            
        combined = ",\n".join(parts)
        if combined:
            new_lines.append(combined + '\n')
    else:
        if in_conflict:
            if section == 'HEAD':
                head_content.append(line)
            else:
                feature_content.append(line)
        else:
            new_lines.append(line)

new_content = "".join(new_lines)

# Fix trailing commas
new_content = re.sub(r',\s*\}', '}', new_content)
new_content = re.sub(r',\s*\]', ']', new_content)
new_content = re.sub(r'\{\s*,', '{', new_content)
new_content = re.sub(r'\[\s*,', '[', new_content)

try:
    json.loads(new_content)
    print("JSON is valid.")
except json.JSONDecodeError as e:
    print(f"JSON invalid: {e}")
    err_line = e.lineno - 1
    lines_arr = new_content.split('\n')
    start = max(0, err_line - 5)
    end = min(len(lines_arr), err_line + 5)
    print("Context:")
    for i in range(start, end):
        print(f"{i+1}: {lines_arr[i]}")

with open('db.json', 'w', encoding='utf-8') as f:
    f.write(new_content)
