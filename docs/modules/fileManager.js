// This module handles file and folder selection using the File System Access API

let selectedFiles = [];

/**
 * Opens a directory picker and reads the files within.
 * @returns {Promise<File[]>} A promise that resolves with an array of file handles.
 */
async function selectFolder() {
    try {
        const dirHandle = await window.showDirectoryPicker();
        const files = [];
        for await (const entry of dirHandle.values()) {
            if (entry.kind === 'file') {
                const file = await entry.getFile();
                files.push(file);
            }
        }
        selectedFiles = files;
        console.log('Selected files:', selectedFiles);
        return files;
    } catch (err) {
        console.error('Error selecting folder:', err);
        return [];
    }
}

/**
 * Gets the currently selected files.
 * @returns {File[]} An array of the selected files.
 */
export function getSelectedFiles() {
    return selectedFiles;
}

/**
 * Renders the file manager UI.
 * @param {HTMLElement} container The element to render content into.
 * @param {object} project The active project.
 */
export function render(container, project) {
    container.innerHTML = `
        <div class="file-manager">
            <h3>File Manager</h3>
            <button id="selectFolderBtn">Select Folder</button>
            <div id="fileListContainer"></div>
        </div>
    `;

    const selectFolderBtn = document.getElementById('selectFolderBtn');
    const fileListContainer = document.getElementById('fileListContainer');

    selectFolderBtn.addEventListener('click', async () => {
        const files = await selectFolder();
        project.files = await Promise.all(files.map(async (file) => ({
            name: file.name,
            content: await file.text(),
        })));

        fileListContainer.innerHTML = '<ul>' +
            files.map(file => `<li>${file.name}</li>`).join('') +
            '</ul>';
    });
}