// docs/modules/templateManager.js

export function initializeTemplateSelection() {
    const templateSelect = document.getElementById('templateSelect');

    if (templateSelect) {
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