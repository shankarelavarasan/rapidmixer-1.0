import { createProject, getProjects, getProject, updateProject } from './modules/projectManager.js';
import { ask as askGemini } from './modules/gemini.js';

document.addEventListener('DOMContentLoaded', () => {
    const newProjectBtn = document.getElementById('newProjectBtn');
    const projectList = document.getElementById('projectList');
    const projectHeader = document.getElementById('projectHeader');
    const moduleView = document.getElementById('moduleView');
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
        // By default, the chat tab is active and its content is already in the HTML.
        // We just need to make sure the correct module is loaded if a different tab is selected.
        loadModule('chat');
    };

    const loadModule = (moduleName) => {
        const tabContent = document.getElementById(moduleName);
        if (!tabContent) return;

        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
        // Deactivate all tab buttons
        document.querySelectorAll('.tab-button').forEach(tb => tb.classList.remove('active'));

        // Show the selected tab content and activate the button
        tabContent.classList.add('active');
        document.querySelector(`.tab-button[data-tab='${moduleName}']`).classList.add('active');

        // Load the module's content
        import(`./modules/${moduleName}.js`).then(module => {
            if (module.render) {
                module.render(tabContent, activeProject);
            }
        }).catch(err => {
            console.error(`Failed to load module: ${moduleName}`, err);
            tabContent.innerHTML = `<p>Error loading module.</p>`;
        });
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

    const askBtn = document.getElementById("askBtn");
    const userInput = document.getElementById("userInput");
    const chatContainer = document.getElementById("chat"); // The chat container is now the 'chat' tab

    askBtn.addEventListener("click", () => {
        const question = userInput.value.trim();
        if (question && activeProject) {
            // Placeholder for sending message within a project context
            console.log(`Sending message in project ${activeProject.name}: ${question}`);
            addMessageToChat("user", question);
            userInput.value = "";
            askGemini(question).then(response => {
                addMessageToChat("bot", response);
            });
        }
    });

    function addMessageToChat(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        messageElement.innerHTML = message; // Use innerHTML to render formatted code
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});
