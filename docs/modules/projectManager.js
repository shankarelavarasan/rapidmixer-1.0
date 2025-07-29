export function createProject(name) {
  const id = `proj_${Date.now()}`;
  const project = {
    id,
    name,
    files: [],
    tasks: [],
    created: new Date().toISOString(),
  };
  let projects = JSON.parse(localStorage.getItem('projects')) || [];
  projects.push(project);
  localStorage.setItem('projects', JSON.stringify(projects));
  return project;
}

export function getProjects() {
  return JSON.parse(localStorage.getItem('projects')) || [];
}

export function getProject(id) {
  const projects = getProjects();
  return projects.find(p => p.id === id);
}

export function updateProject(updatedProject) {
  let projects = getProjects();
  const index = projects.findIndex(p => p.id === updatedProject.id);
  if (index !== -1) {
    projects[index] = updatedProject;
    localStorage.setItem('projects', JSON.stringify(projects));
  }
}
