// This module will handle task management

let tasks = [];

function renderTasks(container) {
    const taskList = container.querySelector('#task-list');
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${task.text}</span>
            <button data-index="${index}" class="delete-task-btn">Delete</button>
        `;
        if (task.completed) {
            li.classList.add('completed');
        }
        li.addEventListener('click', () => {
            tasks[index].completed = !tasks[index].completed;
            renderTasks(container);
        });
        taskList.appendChild(li);
    });
}

export function render(container, project) {
    container.innerHTML = `
        <h2>Task Manager for ${project.name}</h2>
        <div id="task-manager">
            <input type="text" id="new-task-input" placeholder="Add a new task">
            <button id="add-task-btn">Add Task</button>
            <ul id="task-list"></ul>
        </div>
    `;

    const newTaskInput = container.querySelector('#new-task-input');
    const addTaskBtn = container.querySelector('#add-task-btn');

    addTaskBtn.addEventListener('click', () => {
        const text = newTaskInput.value.trim();
        if (text) {
            tasks.push({ text, completed: false });
            newTaskInput.value = '';
            renderTasks(container);
        }
    });

    container.querySelector('#task-list').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-task-btn')) {
            const index = e.target.dataset.index;
            tasks.splice(index, 1);
            renderTasks(container);
        }
    });

    renderTasks(container);
} for each project
import { getProject, updateProject } from './projectManager.js';

export function render(projectId) {
    const project = getProject(projectId);
    const moduleView = document.getElementById('moduleView');
    moduleView.innerHTML = `
        <h2>Task Manager for ${project.name}</h2>
        <ul id="task-list"></ul>
        <input type="text" id="new-task-input" placeholder="New task...">
        <button id="add-task-btn">Add Task</button>
    `;

    const taskList = document.getElementById('task-list');
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');

    const loadTasks = () => {
        taskList.innerHTML = '';
        project.tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <input type="checkbox" data-index="${index}" ${task.completed ? 'checked' : ''}>
                <span>${task.text}</span>
                <button data-index="${index}">Delete</button>
            `;
            taskList.appendChild(li);
        });
    };

    addTaskBtn.addEventListener('click', () => {
        const text = newTaskInput.value.trim();
        if (text) {
            project.tasks.push({ text, completed: false });
            updateProject(project);
            loadTasks();
            newTaskInput.value = '';
        }
    });

    taskList.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const index = e.target.dataset.index;
            project.tasks.splice(index, 1);
            updateProject(project);
            loadTasks();
        }
    });

    taskList.addEventListener('change', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type === 'checkbox') {
            const index = e.target.dataset.index;
            project.tasks[index].completed = e.target.checked;
            updateProject(project);
            loadTasks();
        }
    });

    loadTasks();
}