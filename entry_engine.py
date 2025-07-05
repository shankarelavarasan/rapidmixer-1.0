import os
import re
from datetime import datetime
import sys
import json

def update_template_from_input(template, user_input):
    # Sample rules for extraction
    if "GST" in user_input:
        gst_match = re.search(r'GST[\s:=]*([0-9]+)%?', user_input)
        if gst_match:
            template["GST Rate"] = float(gst_match.group(1))
    if "amount" in user_input.lower():
        amt_match = re.search(r'amount[\s:=]*₹?([0-9]+)', user_input, re.I)
        if amt_match:
            template["Amount"] = float(amt_match.group(1))
    if "date" in user_input.lower():
        date_match = re.search(r'(\d{1,2}-\d{1,2}-\d{4})', user_input)
        if date_match:
            template["Date"] = date_match.group(1)
    return template

def save_template_to_file(template, folder_path):
    file_name = f"entry_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
    file_path = os.path.join(folder_path, file_name)
    with open(file_path, 'w') as f:
        for key, value in template.items():
            if key != "Errors":
                f.write(f"{key}: {value}\n")
        if template["Errors"]:
            f.write(f"Errors: {', '.join(template['Errors'])}\n")
    return file_path

if __name__ == "__main__":
    input_data = json.load(sys.stdin)
    template = input_data['template']
    user_input = input_data['userInput']
    folder_path = input_data['folderPath']

    updated_template = update_template_from_input(template, user_input)
    saved_file_path = save_template_to_file(updated_template, folder_path)
    print(json.dumps({"status": "success", "file_path": saved_file_path}))