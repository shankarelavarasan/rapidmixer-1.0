// docs/modules/templateManager.js

export async function initializeTemplateSelection() {
    const templateSelect = document.getElementById('templateSelect');
    const selectTemplateFileBtn = document.getElementById('selectTemplateFileBtn');

    if (templateSelect && selectTemplateFileBtn) {
        window.templateFiles = [];

        selectTemplateFileBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.addEventListener('change', () => {
                loadTemplateFiles(input.files);
            });
            input.click();
        });

        templateSelect.addEventListener('change', (e) => {
              const selectedName = e.target.value;
              const selectedTemplate = window.templateFiles.find(file => file.name === selectedName);
              if (selectedTemplate) {
                  applyTemplate(selectedName);
              }
          });
    }
}

function loadTemplateFiles(files) {
    const templateSelect = document.getElementById('templateSelect');
    templateSelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a template';
    templateSelect.appendChild(defaultOption);

    window.templateFiles = [];
    const allowedExtensions = ['.docx', '.pdf', '.txt', '.md'];

    Array.from(files).forEach(file => {
         const ext = file.name.slice(file.name.lastIndexOf('.'));
         if (allowedExtensions.includes(ext)) {
             const reader = new FileReader();
             reader.onload = (e) => {
                 window.templateFiles.push({
                     name: file.name,
                     content: e.target.result.split(',')[1],
                     type: file.type
                 });
                 const option = document.createElement('option');
                 option.value = file.name;
                 option.textContent = file.name;
                 templateSelect.appendChild(option);
             };
             reader.readAsDataURL(file);
         }
     });
}

function applyTemplate(templateName) {
     const promptTextarea = document.getElementById('promptTextarea');
     if (!promptTextarea) return;
 
     promptTextarea.value = `Using template: ${templateName}`;
     
     const event = new CustomEvent('templateApplied', {
         detail: { templateName }
     });
     document.dispatchEvent(event);
 }