import { createProject, getProjects, getProject, updateProject } from './modules/projectManager.js';

document.addEventListener('DOMContentLoaded', () => {
    const newProjectBtn = document.getElementById('newProjectBtn');
    const projectList = document.getElementById('projectList');
    const projectHeader = document.getElementById('projectHeader');
    const moduleView = document.getElementById('moduleView');

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
        projectHeader.innerHTML = `
            <h1>${activeProject.name}</h1>
            <div class="module-switcher">
                <button data-module="ocr">OCR</button>
                <button data-module="voiceToText">Voice to Text</button>
                <button data-module="taskManager">Task Manager</button>
                <button data-module="gemini">Gemini</button>
                <button data-module="docGenerator">Doc Generator</button>
            </div>
        `;
        loadModule('gemini'); // Load Gemini module by default
    };

    const loadModule = (moduleName) => {
        moduleView.innerHTML = '';
        import(`./modules/${moduleName}.js`).then(module => {
            if (module.render) {
                module.render(activeProject);
            }
        }).catch(err => {
            console.error(`Failed to load module: ${moduleName}`, err);
            moduleView.innerHTML = `<p>Error loading module.</p>`;
        });
    };

    projectHeader.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.module) {
            loadModule(e.target.dataset.module);
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

    const askBtn = document.getElementById("askBtn");
    const userInput = document.getElementById("userInput");
    const chatContainer = document.getElementById("chat-container");

    askBtn.addEventListener("click", () => {
        const question = userInput.value.trim();
        if (question && activeProject) {
            // Placeholder for sending message within a project context
            console.log(`Sending message in project ${activeProject.name}: ${question}`);
            addMessageToChat("user", question);
            userInput.value = "";
            // The response will be handled by the gemini.js module later
        }
    });

    function addMessageToChat(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        messageElement.textContent = message;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});
