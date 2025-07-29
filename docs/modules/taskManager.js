import { generateContent } from './geminiEngine.js';
import { exportAsTxt } from './exportManager.js';

let tasks = [];

// Using a generic key for simplicity, not project-specific for now
const TASKS_STORAGE_KEY = 'rapidAITasks';

function getTasks() {
  const tasksJson = localStorage.getItem(TASKS_STORAGE_KEY);
  return tasksJson ? JSON.parse(tasksJson) : [];
}

function saveTasks(tasks) {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

export function render(container, project) {
  tasks = getTasks();

  container.innerHTML = `
        <h3>Task Manager</h3>
        <p>Generate a list of tasks from your files using a prompt.</p>
        <div class="task-generator">
            <textarea id="taskPrompt" placeholder="e.g., 'Create a checklist for onboarding a new client based on the attached documents.'"></textarea>
            <button id="generateTasksBtn">Generate Tasks</button>
        </div>
        <h4>Generated Tasks</h4>
        <ul id="taskList"></ul>
        <div class="export-controls">
            <button id="exportTasksBtn">Export as TXT</button>
        </div>
    `;

  const taskList = document.getElementById('taskList');
  const generateTasksBtn = document.getElementById('generateTasksBtn');
  const taskPromptInput = document.getElementById('taskPrompt');
  const exportTasksBtn = document.getElementById('exportTasksBtn');

  function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
      const li = document.createElement('li');
      li.className = task.completed ? 'completed' : '';
      li.innerHTML = `
                <input type="checkbox" data-index="${index}" class="complete-chk" ${task.completed ? 'checked' : ''}>
                <span>${task.text}</span>
                <button data-index="${index}" class="delete-btn">❌</button>
            `;
      taskList.appendChild(li);
    });
  }

  generateTasksBtn.addEventListener('click', async () => {
    const prompt = taskPromptInput.value.trim();
    if (!prompt) {
      alert('Please enter a prompt.');
      return;
    }

    if (!project.files || project.files.length === 0) {
      alert('Please select files in the File Manager first.');
      return;
    }

    generateTasksBtn.textContent = 'Generating...';
    generateTasksBtn.disabled = true;

    try {
      const fullPrompt = `You are a task generation assistant. Based on the user's prompt and the provided files, create a clear, actionable list of tasks. Return ONLY the tasks, each on a new line. Do not add any introductory text, numbering, or bullet points. \n\nUser Prompt: ${prompt}`;
      const result = await generateContent(project, fullPrompt);
      const generatedTasks = result.split('\n').filter(t => t.trim() !== '');

      tasks = generatedTasks.map(text => ({ text, completed: false }));
      saveTasks(tasks);
      renderTasks();
    } catch (error) {
      console.error('Error generating tasks:', error);
      alert('Failed to generate tasks. See console for details.');
    } finally {
      generateTasksBtn.textContent = 'Generate Tasks';
      generateTasksBtn.disabled = false;
    }
  });

  taskList.addEventListener('click', e => {
    const index = e.target.dataset.index;
    if (e.target.classList.contains('delete-btn')) {
      tasks.splice(index, 1);
    } else if (e.target.classList.contains('complete-chk')) {
      tasks[index].completed = e.target.checked;
    }
    saveTasks(tasks);
    renderTasks();
  });

  exportTasksBtn.addEventListener('click', () => {
    if (tasks.length === 0) {
      alert('No tasks to export.');
      return;
    }
    const taskText = tasks
      .map(t => `- [${t.completed ? 'x' : ' '}] ${t.text}`)
      .join('\n');
    exportAsTxt(taskText, 'tasks.txt');
  });

  renderTasks();
}
