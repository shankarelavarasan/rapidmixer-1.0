// docs/modules/fileManager.js

export function initializeFileSelection() {
    const selectFileBtn = document.getElementById('selectFileBtn');
    const selectFolderBtn = document.getElementById('selectFolderBtn');
    const selectedFilesDiv = document.getElementById('selectedFiles');

    if (selectFileBtn) {
        selectFileBtn.addEventListener('click', () => {
            console.log('Select File button clicked');
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.addEventListener('change', () => {
                displaySelectedFiles(input.files);
            });
            input.click();
        });
    }

    if (selectFolderBtn) {
        selectFolderBtn.addEventListener('click', () => {
            console.log('Select Folder button clicked');
            const input = document.createElement('input');
            input.type = 'file';
            input.webkitdirectory = true;
            input.directory = true;
            input.multiple = true;
            input.addEventListener('change', () => {
                displaySelectedFiles(input.files);
            });
            input.click();
        });
    }

    function displaySelectedFiles(files) {
        selectedFilesDiv.innerHTML = ''; // Clear previous selections
        if (files.length > 0) {
            const list = document.createElement('ul');
            for (const file of files) {
                const item = document.createElement('li');
                item.textContent = file.webkitRelativePath || file.name;
                list.appendChild(item);
            }
            selectedFilesDiv.appendChild(list);
        }
    }
}