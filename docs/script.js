import { createProject, getProjects, getProject } from './modules/projectManager.js';
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
        loadModule('chat'); // Load chat by default
    };

    const loadModule = async (moduleName) => {
        // Deactivate all tabs
        document.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Activate the selected tab
        const tabButton = document.querySelector(`.tab-button[data-tab='${moduleName}']`);
        const tabContent = document.getElementById(moduleName.split('/').pop().replace('.js',''));
        if (tabButton && tabContent) {
            tabButton.classList.add('active');
            tabContent.classList.add('active');

            if (moduleName !== 'chat') {
                try {
                    const module = await import(`./modules/${moduleName}.js`);
                    if (module.render) {
                        tabContent.innerHTML = ''; // Clear previous content
                        module.render(tabContent, activeProject);
                    }
                } catch (err) {
                    console.error(`Failed to load module: ${moduleName}`, err);
                    tabContent.innerHTML = `<p>Error loading module.</p>`;
                }
            }
        }
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
    const chatContainer = document.getElementById("chat-container");
    const askBtn = document.getElementById('askBtn');
    const userInput = document.getElementById('userInput');

    const handleAsk = () => {
        const question = userInput.value.trim();
        if (question && activeProject) {
            addMessageToChat('user', question);
            userInput.value = '';
            askGemini(question).then(response => {
                addMessageToChat('bot', response);
            });
        }
    };

    askBtn.addEventListener('click', handleAsk);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAsk();
        }
    });

    function addMessageToChat(sender, message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        // Sanitize message to prevent XSS, but allow basic formatting. For a real app, use a library like DOMPurify.
        // For now, we'll just set textContent for safety, and handle code blocks separately.
        if (message.startsWith('```')) {
            const codeBlock = document.createElement('pre');
            const code = document.createElement('code');
            // Extract language and code
            const lang = message.match(/```(\w*)/)[1] || '';
            code.className = `language-${lang}`;
            code.textContent = message.replace(/```\w*\n/, '').replace(/\n```/, '');
            codeBlock.appendChild(code);
            messageElement.appendChild(codeBlock);
            // If you have a syntax highlighter like Prism.js, you would call it here:
            // Prism.highlightElement(code);
        } else {
            messageElement.textContent = message;
        }

        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
});
