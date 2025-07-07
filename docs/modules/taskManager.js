// This module will handle the Task Manager functionality

function getTasks(projectId) {
    const tasks = localStorage.getItem(`tasks_${projectId}`);
    return tasks ? JSON.parse(tasks) : [];
}

function saveTasks(projectId, tasks) {
    localStorage.setItem(`tasks_${projectId}`, JSON.stringify(tasks));
}

export function render(container, project) {
    container.innerHTML = `
        <h3>Task Manager for ${project.name}</h3>
        <div id="taskForm">
            <input type="text" id="taskInput" placeholder="Add a new task...">
            <button id="addTaskBtn">Add Task</button>
        </div>
        <ul id="taskList"></ul>
    `;

    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
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

    addTaskBtn.addEventListener('click', () => {
        const text = taskInput.value.trim();
        if (text) {
            const tasks = getTasks(project.id);
            tasks.push({ text, completed: false });
            saveTasks(project.id, tasks);
            taskInput.value = '';
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

    // Add some basic styling for the task manager
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
        #taskForm {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
        }
        #taskInput {
            flex-grow: 1;
            padding: 8px;
        }
    `;
    container.appendChild(style);
}