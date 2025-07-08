// This module handles template selection

const templates = [
    { id: 'invoice', name: 'Invoice', path: '/templates/invoice.html' },
    { id: 'bankProject', name: 'Bank Project Summary', path: '/templates/bankProject.txt' },
    { id: 'summary', name: 'Excel Summary', path: '/templates/summary.txt' },
];

let selectedTemplate = null;

/**
 * Gets the list of available templates.
 * @returns {object[]} An array of template objects.
 */
export function getTemplates() {
    return templates;
}

/**
 * Sets the active template.
 * @param {string} templateId The ID of the template to select.
 */
export function selectTemplate(templateId) {
    selectedTemplate = templates.find(t => t.id === templateId);
    console.log('Selected template:', selectedTemplate);
}

/**
 * Gets the currently selected template.
 * @returns {object|null} The selected template object or null.
 */
export function getSelectedTemplate() {
    return selectedTemplate;
}

/**
 * Renders the template manager UI.
 * @param {HTMLElement} container The element to render content into.
 * @param {object} project The active project.
 */
export function render(container, project) {
    container.innerHTML = `
        <div class="template-manager">
            <h3>Template Selector</h3>
            <p>Select a template to apply to the AI's output.</p>
            <select id="templateSelector">
                <option value="">--Select a Template--</option>
                ${templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
            </select>
        </div>
    `;

    const templateSelector = document.getElementById('templateSelector');
    templateSelector.addEventListener('change', (e) => {
        selectTemplate(e.target.value);
        if (project) {
            project.templateId = e.target.value;
        }
    });

    if (project && project.templateId) {
        templateSelector.value = project.templateId;
    }
}