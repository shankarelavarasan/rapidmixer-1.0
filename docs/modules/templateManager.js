// docs/modules/templateManager.js

export async function initializeTemplateSelection() {
    const templateSelect = document.getElementById('templateSelect');

    if (templateSelect) {
        // Load local templates instead of fetching from backend
        const templates = {
            'bank': 'Bank Project Template',
            'bill': 'Bill Entry Template',
            'document': 'Company Document Template',
            'invoice': 'Invoice Processing Template',
            'summary': 'Document Summary Template'
        };

        // Clear existing options
        templateSelect.innerHTML = '';

        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a template';
        templateSelect.appendChild(defaultOption);

        // Add template options
        Object.entries(templates).forEach(([value, text]) => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            templateSelect.appendChild(option);
        });

        templateSelect.addEventListener('change', (e) => {
            const selectedTemplate = e.target.value;
            console.log(`Template selected: ${selectedTemplate}`);
            
            // Apply template directly without server call
            applyLocalTemplate(selectedTemplate);
        });
    }
}

function applyLocalTemplate(templateName) {
    const promptTextarea = document.getElementById('promptTextarea');
    if (!promptTextarea) return;

    // Get template content from local storage or predefined templates
    const templateContent = getLocalTemplateContent(templateName);
    
    promptTextarea.value = `Using template: ${templateName}\n\n${templateContent}`;
    
    // Dispatch event to notify other components
    const event = new CustomEvent('templateApplied', {
        detail: { templateName }
    });
    document.dispatchEvent(event);
}

function getLocalTemplateContent(templateName) {
    // This could be extended to load from localStorage or local files
    const templates = {
        'bank': 'Process bank statements and extract transactions',
        'bill': 'Extract bill details including vendor, amount, and date',
        'document': 'Process company documents and extract key information',
        'invoice': 'Extract invoice details including line items and totals',
        'summary': 'Generate a summary of the document content'
    };
    
    return templates[templateName] || '';
}

export async function getTemplateContent(templateName) {
    if (!templateName) return '';
    
    // Use local template content instead of fetching from server
    return getLocalTemplateContent(templateName);
}