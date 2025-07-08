import { createProject, getProjects, getProject } from './modules/projectManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const newProjectBtn = document.getElementById('newProjectBtn');
    const projectList = document.getElementById('projectList');
    const projectHeader = document.getElementById('projectHeader');
    const tabContainer = document.getElementById('tabContainer');

    let activeProject = null;

    const loadProjects = () => {
        projectList.innerHTML = '';
        const projects = getProjects();
        projects.forEach(project => {
            const li = document.createElement('li');
            li.textContent = project.name;
            li.dataset.projectId = project.id;
            li.addEventListener('click', () => {
                setActiveProject(project.id);
            });
            projectList.appendChild(li);
        });
    };

    const setActiveProject = (projectId) => {
        activeProject = getProject(projectId);
        projectHeader.innerHTML = `<h1>${activeProject.name}</h1>`;
        loadModule('chat'); // Load chat by default
    };

    const loadModule = async (moduleName) => {
        // Deactivate all tabs and content
        document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Activate the selected tab and content
        const tabButton = document.querySelector(`.tab-button[data-tab='${moduleName}']`);
        const tabContent = document.getElementById(moduleName);
        
        if (tabButton && tabContent) {
            tabButton.classList.add('active');
            tabContent.classList.add('active');

            try {
                const module = await import(`./modules/${moduleName}.js`);
                if (module.render) {
                    tabContent.innerHTML = ''; // Clear previous content
                    module.render(tabContent, activeProject);
                }
            } catch (err) {
                console.error(`Failed to load module: ${moduleName}`, err);
                if (moduleName !== 'chat') { // Don't show error for chat module if it's handled differently
                    tabContent.innerHTML = `<p>Error loading module.</p>`;
                }
            }
        }
    };

    tabContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-button')) {
            const moduleName = e.target.dataset.tab;
            loadModule(moduleName);
        }
    });

    newProjectBtn.addEventListener('click', () => {
        const projectName = prompt('Enter project name:');
        if (projectName) {
            const newProject = createProject(projectName);
            setActiveProject(newProject.id);
            loadProjects();
        }
    });

    loadProjects();
});
