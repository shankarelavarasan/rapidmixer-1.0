// This module will handle the Task Manager functionality

function getTasks(projectId) {
    const tasks = localStorage.getItem(`tasks_${projectId}`);
    return tasks ? JSON.parse(tasks) : [];
}

function saveTasks(projectId, tasks) {
    localStorage.setItem(`tasks_${projectId}`, JSON.stringify(tasks));
}

import { askGemini } from './gemini.js';

function getTasks(projectId) {
    const tasks = localStorage.getItem(`tasks_${projectId}`);
    return tasks ? JSON.parse(tasks) : [];
}

function saveTasks(projectId, tasks) {
    localStorage.setItem(`tasks_${projectId}`, JSON.stringify(tasks));
}

export function render(container, project) {
    if (!project) {
        container.innerHTML = '<h3>Task Manager</h3><p>Please select a project to see its tasks.</p>';
        return;
    }

    container.innerHTML = `
        <h3>Task Manager for ${project.name}</h3>
        <div id="taskGenerator">
            <textarea id="taskPrompt" placeholder="Enter a prompt to generate tasks..."></textarea>
            <button id="generateTasksBtn">Generate Tasks</button>
        </div>
        <ul id="taskList"></ul>
    `;

    const taskPrompt = document.getElementById('taskPrompt');
    const generateTasksBtn = document.getElementById('generateTasksBtn');
    const taskList = document.getElementById('taskList');

    const renderTasks = () => {
        const tasks = getTasks(project.id);
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
                <div>
                    <button data-index="${index}" class="complete-btn">✔️</button>
                    <button data-index="${index}" class="delete-btn">❌</button>
                </div>
            `;
            taskList.appendChild(li);
        });
    };

    generateTasksBtn.addEventListener('click', async () => {
        const prompt = taskPrompt.value.trim();
        if (prompt && project.files && project.files.length > 0) {
            const filesData = await Promise.all(project.files.map(async (file) => ({
                name: file.name,
                type: file.type,
                content: await file.text(),
            })));

            const fullPrompt = `${prompt}\n\nHere are the files:\n\n${filesData.map(f => `--- ${f.name} ---\n${f.content}`).join('\n\n')}`;
            const generatedTasks = await askGemini(fullPrompt);

            // Assuming Gemini returns a list of tasks separated by newlines
            const newTasks = generatedTasks.split('\n').map(text => ({ text, completed: false }));
            const existingTasks = getTasks(project.id);
            const allTasks = existingTasks.concat(newTasks);
            saveTasks(project.id, allTasks);
            renderTasks();
        }
    });

    taskList.addEventListener('click', (e) => {
        const tasks = getTasks(project.id);
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.dataset.index;
            tasks.splice(index, 1);
        } else if (e.target.classList.contains('complete-btn')) {
            const index = e.target.dataset.index;
            tasks[index].completed = !tasks[index].completed;
        }
        saveTasks(project.id, tasks);
        renderTasks();
    });

    renderTasks();

    const style = document.createElement('style');
    style.textContent = `
        #taskList li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
        #taskList li .completed {
            text-decoration: line-through;
            color: #aaa;
        }
        #taskGenerator {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 20px;
        }
        #taskPrompt {
            width: 100%;
            height: 100px;
        }
    `;
    container.appendChild(style);
}