import os
import re
import json
import sys
import argparse
from datetime import datetime
from PIL import Image
import pytesseract

# --- Configuration ---
# In a real application, this might be in a separate config.py or a .json file
CONFIG = {
    "date_regex": r'(\d{1,2}-\d{1,2}-\d{4})',
    "gst_regex": r'GST[\s:=]*([\d.]+)',
    "amount_regex": r'amount[\s:=₹]*([\d,.]+)'
}

# --- Core Functions ---

def extract_text_from_image(image_path):
    """Extracts text from an image file using Tesseract OCR."""
    try:
        return pytesseract.image_to_string(Image.open(image_path))
    except FileNotFoundError:
        return {"error": f"Image file not found at {image_path}"}
    except Exception as e:
        return {"error": f"Error processing image: {e}"}

def parse_input(text, config):
    """Parses text to extract structured data based on regex patterns."""
    data = {}
    errors = []

    # Extract Date
    date_match = re.search(config['date_regex'], text)
    if date_match:
        data["Date"] = date_match.group(1)
    else:
        errors.append("Date not found")

    # Extract GST Rate
    gst_match = re.search(config['gst_regex'], text, re.IGNORECASE)
    if gst_match:
        try:
            data["GST Rate"] = float(gst_match.group(1))
        except ValueError:
            errors.append(f"Invalid GST value: {gst_match.group(1)}")
    else:
        errors.append("GST Rate not found")

    # Extract Amount
    amt_match = re.search(config['amount_regex'], text, re.IGNORECASE)
    if amt_match:
        try:
            amount_str = amt_match.group(1).replace(',', '')
            data["Amount"] = float(amount_str)
        except ValueError:
            errors.append(f"Invalid Amount value: {amt_match.group(1)}")
    else:
        errors.append("Amount not found")

    if errors:
        data["Errors"] = errors

    return data

def save_entry(data, folder_path):
    """Saves the extracted data to a timestamped text file."""
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    file_name = f"entry_{timestamp}.json"
    file_path = os.path.join(folder_path, file_name)

    try:
        with open(file_path, 'w') as f:
            json.dump(data, f, indent=4)
        return {"status": "success", "file_path": file_path}
    except IOError as e:
        return {"status": "error", "message": f"Failed to save file: {e}"}

# --- Main Execution ---

def main():
    """Main function to handle command-line arguments and process input."""
    parser = argparse.ArgumentParser(description="Process invoices from text or images.")
    parser.add_argument('--input-text', type=str, help="Direct text input to process.")
    parser.add_argument('--input-file', type=str, help="Path to a text or image file to process.")
    parser.add_argument('--output-dir', type=str, default='entries', help="Directory to save the output files.")
    parser.add_argument('--stdin', action='store_true', help="Read JSON input from stdin.")

    args = parser.parse_args()

    text_to_process = ""
    output_data = {}

    if args.stdin:
        try:
            input_data = json.load(sys.stdin)
            text_to_process = input_data.get('userInput', '')
            args.output_dir = input_data.get('folderPath', args.output_dir)
        except json.JSONDecodeError:
            output_data = {"status": "error", "message": "Invalid JSON from stdin"}
            print(json.dumps(output_data))
            return

    elif args.input_text:
        text_to_process = args.input_text

    elif args.input_file:
        if not os.path.exists(args.input_file):
            output_data = {"status": "error", "message": f"Input file not found: {args.input_file}"}
        else:
            _, ext = os.path.splitext(args.input_file)
            if ext.lower() in ['.png', '.jpg', '.jpeg', '.bmp', '.tiff']:
                ocr_result = extract_text_from_image(args.input_file)
                if "error" in ocr_result:
                    output_data = {"status": "error", "message": ocr_result["error"]}
                else:
                    text_to_process = ocr_result
            else:
                with open(args.input_file, 'r') as f:
                    text_to_process = f.read()

    if text_to_process:
        parsed_data = parse_input(text_to_process, CONFIG)
        result = save_entry(parsed_data, args.output_dir)
        output_data = {**parsed_data, **result}
    
    elif not output_data: # No input was provided
        output_data = {"status": "error", "message": "No input provided. Use --input-text, --input-file, or --stdin."}

    print(json.dumps(output_data, indent=4))

if __name__ == "__main__":
    main()