# Rapid AI Assistant - Complete File Processing Workflow

A comprehensive web application that processes mixed file types (PDF, Excel, company documents) using Gemini AI API, applies user-defined templates, and provides multiple export options with error handling and user approval workflows.

## 🎯 Key Features

- **Multi-file Processing**: Handle PDF, Excel, Word, CSV files in batch
- **Template Integration**: Apply custom Excel templates for data formatting
- **AI-Powered Processing**: Utilize Gemini API for intelligent data extraction
- **Error Handling**: Interactive error resolution with user approval
- **Multiple Export Formats**: Excel, CSV, PDF, JSON output options
- **Real-time Progress**: Live processing updates via Socket.IO
- **Voice Input Support**: Speech-to-text for prompts
- **GitHub Integration**: Template storage and version control

## 🚀 Quick Start

### 1. Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Gemini API key and settings

# Start the server
npm start
# or for development
npm run dev
```

### 2. Environment Configuration

Create `.env` file:
```env
GEMINI_API_KEY=your-gemini-api-key-here
PORT=3000
NODE_ENV=development
```

### 3. Access the Application

- **Local**: http://localhost:3000
- **Production**: https://shankarelavarasan.github.io/rapid-ai-assistant

## 📋 Complete Workflow

### Step 1: File Selection
1. Click "Browse Files" to select individual files
2. Or click "Browse Folder" to select entire folders
3. Supported formats: PDF, Excel (.xlsx/.xls), Word (.docx/.doc), CSV
4. Maximum file size: 50MB per file

### Step 2: Template Selection (Optional)
1. Upload your custom Excel template
2. Template defines output format and data structure
3. If no template provided, system generates summary format

### Step 3: Prompt Creation
1. Type your processing prompt in the text area
2. Use voice input for hands-free prompt creation
3. Example prompts:
   - "Extract all invoice numbers and amounts"
   - "Find all customer contact information"
   - "Convert all tables to structured data"

### Step 4: Processing
1. Click "Process Files" to start
2. Monitor real-time progress updates
3. System processes files sequentially with error handling

### Step 5: Error Handling
- If processing fails for any file:
  - Error details displayed
  - User asked to approve continuation
  - Can skip problematic files or stop processing

### Step 6: Export Options
After processing completes, choose export format:
- **Excel**: Structured workbook with multiple sheets
- **CSV**: Comma-separated values for spreadsheet import
- **PDF**: Professional formatted report
- **JSON**: Raw data for API integration

## 🔧 API Endpoints

### File Processing
```
POST /api/process-file
Content-Type: multipart/form-data

Body:
- file: File to process
- prompt: Processing instructions
- template: Optional Excel template

Response:
{
  "filename": "document.pdf",
  "content": "extracted text",
  "extracted_data": {...},
  "processed_at": "2024-01-01T00:00:00.000Z"
}
```

### Export Data
```
POST /api/export
Content-Type: application/json

Body:
{
  "format": "excel|csv|pdf|json",
  "data": {
    "results": [...],
    "errors": [...],
    "metadata": {...}
  }
}
```

## 🗂️ Project Structure

```
rapid-ai-assistant/
├── docs/                    # Frontend application
│   ├── index.html          # Main HTML file
│   ├── script.js           # Application initialization
│   └── modules/            # Frontend modules
│       ├── integratedProcessor.js  # Main workflow
│       ├── fileManager.js        # File handling
│       ├── templateManager.js    # Template management
│       ├── voiceManager.js       # Voice input
│       ├── uiManager.js          # UI updates
│       ├── errorHandler.js       # Error handling
│       └── stateManager.js       # Application state
├── server/                 # Backend API
│   ├── api/
│   │   ├── process-file.js # File processing endpoint
│   │   └── export.js       # Export functionality
│   ├── routes/             # API routes
│   └── middleware/         # Express middleware
├── uploads/                # Temporary file storage
├── output/                 # Generated exports
└── __tests__/             # Test suites
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- fileManager.test.js
npm test -- uiManager.test.js
npm test -- stateManager.test.js

# Lint code
npm run lint

# Format code
npm run format
```

## 🎯 Use Cases

### Accounting & Finance
- Process invoices and receipts
- Extract financial data from statements
- Generate expense reports

### HR & Recruitment
- Parse resumes and CVs
- Extract candidate information
- Create employee databases

### Legal & Compliance
- Process contracts and agreements
- Extract key terms and clauses
- Generate compliance reports

### Sales & Marketing
- Analyze customer documents
- Extract contact information
- Process survey responses

## 🛠️ Development

### Adding New File Types
1. Update `validateFile()` in integratedProcessor.js
2. Add parser in server/api/process-file.js
3. Update file type validation
4. Add appropriate tests

### Custom Templates
1. Create Excel template with required columns
2. Upload via template selection
3. System auto-detects format and applies

### New Export Formats
1. Add format handler in server/api/export.js
2. Update export options in integratedProcessor.js
3. Add format-specific UI elements

## 🐛 Troubleshooting

### Common Issues

**Error: "Cannot read properties of null"**
- Ensure all HTML elements exist before JavaScript runs
- Check element IDs match between HTML and JavaScript

**Error: "FILE_VALIDATION is not defined"**
- Verify fileManager.js has FILE_VALIDATION constants
- Check file type restrictions

**Gemini API Errors**
- Verify API key in .env file
- Check API key permissions
- Ensure proper billing setup

**File Upload Issues**
- Check file size limits (50MB)
- Verify file types are supported
- Ensure uploads directory exists

## 📊 Performance Tips

1. **Batch Processing**: Process multiple files together
2. **Template Usage**: Use templates for consistent output
3. **Error Handling**: Review errors before continuing
4. **Export Selection**: Choose appropriate format for use case

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- [Live Demo](https://shankarelavarasan.github.io/rapid-ai-assistant)
- [GitHub Repository](https://github.com/shankarelavarasan/rapid-ai-assistant)
- [Gemini API Documentation](https://ai.google.dev/gemini-api/docs)
- [Issue Tracker](https://github.com/shankarelavarasan/rapid-ai-assistant/issues)

---

**Ready to process your files?** 
Start the application and follow the workflow above to transform your documents with AI-powered processing.
