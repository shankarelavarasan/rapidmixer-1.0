// docs/modules/templateManager.js

export async function initializeTemplateSelection() {
    const templateSelect = document.getElementById('templateSelect');

    if (templateSelect) {
        try {
            const response = await fetch('/api/templates');
            const templates = await response.json();
            templates.forEach(template => {
                const option = document.createElement('option');
                option.value = template;
                option.textContent = template;
                templateSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching templates:', error);
        }

        templateSelect.addEventListener('change', (e) => {
            const selectedTemplate = e.target.value;
            console.log(`Template selected: ${selectedTemplate}`);
            // You can add more logic here to apply the template
            const promptTextarea = document.getElementById('promptTextarea');
            if(promptTextarea) {
                promptTextarea.value = `Using template: ${selectedTemplate}\n\n`;
            }
        });
    }
}

export async function getTemplateContent(templateName) {
    if (!templateName) return '';
    try {
        const response = await fetch(`/templates/${templateName}`);
        return await response.text();
    } catch (error) {
        console.error(`Error fetching template content for ${templateName}:`, error);
        return '';
    }
}