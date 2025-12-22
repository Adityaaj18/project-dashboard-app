import React, { useState } from 'react';
import './ProjectApp.css';

const ProjectApp = ({ dataContext }) => {
  console.log('ProjectApp received dataContext:', dataContext);
  console.log('dataContext.addProject:', dataContext?.addProject);

  // Use data from context (real API data)
  const projects = dataContext?.projects || [];
  const updateTask = dataContext?.updateTask;
  const addTaskToProject = dataContext?.addTask;
  const deleteTaskFromProject = dataContext?.deleteTask;
  const addProjectToContext = dataContext?.addProject;

  const [selectedProject, setSelectedProject] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'active'
  });

  const getTaskCounts = (tasks) => {
    if (!tasks) return { todo: 0, inProgress: 0, done: 0, total: 0 };
    return {
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in-progress').length,
      done: tasks.filter(t => t.status === 'done').length,
      total: tasks.length
    };
  };

  const updateTaskStatus = async (projectId, taskId, newStatus) => {
    if (updateTask) {
      await updateTask(projectId, taskId, { status: newStatus });
    }
  };

  const addTask = async (projectId) => {
    if (!newTaskTitle.trim()) return;

    if (addTaskToProject) {
      try {
        await addTaskToProject(projectId, {
          title: newTaskTitle,
          status: 'todo'
        });
        setNewTaskTitle('');
      } catch (error) {
        console.error('Error adding task:', error);
        alert('Failed to add task');
      }
    }
  };

  const deleteTask = async (projectId, taskId) => {
    if (deleteTaskFromProject) {
      try {
        await deleteTaskFromProject(projectId, taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
      }
    }
  };

  const createProject = async () => {
    console.log('createProject called, newProject:', newProject);
    console.log('addProjectToContext exists?', !!addProjectToContext);

    if (!newProject.name.trim()) {
      alert('Project name is required');
      return;
    }

    if (addProjectToContext) {
      try {
        console.log('Calling addProjectToContext...');
        await addProjectToContext(newProject);
        console.log('Project created successfully');
        setNewProject({ name: '', description: '', status: 'active' });
        setShowCreateProject(false);
      } catch (error) {
        console.error('Error creating project:', error);
        alert('Failed to create project: ' + error.message);
      }
    } else {
      console.error('addProjectToContext is not available!');
      alert('Cannot create project - context not available');
    }
  };

  const selectedProjectData = selectedProject
    ? projects.find(p => p.id === selectedProject)
    : null;

  return (
    <div className="project-app">
      <div className="project-header">
        <h2>Project Management</h2>
        <p>Manage your projects and tasks</p>
      </div>

      <div className="project-container">
        <div className="project-list-section">
          <div className="project-list-header">
            <h3>Projects</h3>
            <button
              className="create-project-btn"
              onClick={() => {
                console.log('Create project button clicked, current state:', showCreateProject);
                setShowCreateProject(!showCreateProject);
              }}
            >
              {showCreateProject ? '✕ Cancel' : '+ New Project'}
            </button>
          </div>

          {showCreateProject && (
            <div className="create-project-form">
              <input
                type="text"
                placeholder="Project Name *"
                value={newProject.name}
                onChange={(e) => setNewProject({...newProject, name: e.target.value})}
              />
              <textarea
                placeholder="Description (optional)"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                rows="3"
              />
              <select
                value={newProject.status}
                onChange={(e) => setNewProject({...newProject, status: e.target.value})}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              <button className="submit-project-btn" onClick={createProject}>
                Create Project
              </button>
            </div>
          )}

          <div className="project-list">
            {projects.length === 0 ? (
              <div className="empty-project-list">
                <p>No projects yet</p>
                <p className="empty-hint">Click "+ New Project" to create your first project</p>
              </div>
            ) : (
              projects.map(project => {
                const taskCounts = getTaskCounts(project.tasks);
                return (
                  <div
                    key={project.id}
                    className={`project-item ${selectedProject === project.id ? 'selected' : ''}`}
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <div className="project-item-header">
                      <h4>{project.name}</h4>
                      <span className="task-count-badge">{taskCounts.total}</span>
                    </div>
                    <p className="project-item-description">{project.description}</p>
                    <div className="project-item-stats">
                      <span className="stat-badge todo">{taskCounts.todo} To Do</span>
                      <span className="stat-badge in-progress">{taskCounts.inProgress} In Progress</span>
                      <span className="stat-badge done">{taskCounts.done} Done</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="task-detail-section">
          {selectedProjectData ? (
            <>
              <div className="task-section-header">
                <div>
                  <h3>{selectedProjectData.name}</h3>
                  <p>{selectedProjectData.description}</p>
                </div>
                <button className="close-btn" onClick={() => setSelectedProject(null)}>
                  ×
                </button>
              </div>

              <div className="add-task-form">
                <input
                  type="text"
                  placeholder="Enter new task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask(selectedProjectData.id)}
                />
                <button onClick={() => addTask(selectedProjectData.id)}>
                  Add Task
                </button>
              </div>

              <div className="task-columns">
                {['todo', 'in-progress', 'done'].map(status => {
                  const statusTasks = (selectedProjectData.tasks || []).filter(t => t.status === status);
                  const statusLabels = {
                    'todo': 'To Do',
                    'in-progress': 'In Progress',
                    'done': 'Done'
                  };

                  return (
                    <div key={status} className="task-column">
                      <div className="task-column-header" style={{
                        borderColor: status === 'todo' ? '#f85149' : status === 'in-progress' ? '#d29922' : '#3fb950'
                      }}>
                        <h4>{statusLabels[status]}</h4>
                        <span className="task-column-count">{statusTasks.length}</span>
                      </div>

                      <div className="task-list">
                        {statusTasks.length === 0 ? (
                          <div className="empty-column">No tasks</div>
                        ) : (
                          statusTasks.map(task => (
                            <div key={task.id} className="task-card">
                              <div className="task-card-content">
                                <p>{task.title}</p>
                              </div>
                              <div className="task-card-actions">
                                <select
                                  className="status-select"
                                  value={task.status}
                                  onChange={(e) => updateTaskStatus(selectedProjectData.id, task.id, e.target.value)}
                                >
                                  <option value="todo">To Do</option>
                                  <option value="in-progress">In Progress</option>
                                  <option value="done">Done</option>
                                </select>
                                <button
                                  className="delete-task-btn"
                                  onClick={() => deleteTask(selectedProjectData.id, task.id)}
                                  title="Delete task"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="no-project-selected">
              <div className="empty-state">
                <h3>No Project Selected</h3>
                <p>Select a project from the list to view and manage its tasks</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectApp;
