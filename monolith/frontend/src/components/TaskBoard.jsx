import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tasksAPI, projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './TaskBoard.css';

function TaskBoard() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { permissions } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [newTaskColumn, setNewTaskColumn] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const columns = [
    { id: 'todo', label: 'To Do', color: '#da3633' },
    { id: 'in-progress', label: 'In Progress', color: '#d29922' },
    { id: 'done', label: 'Done', color: '#2ea043' }
  ];

  useEffect(() => {
    loadProject();
    loadTasks();
  }, [projectId]);

  const loadProject = async () => {
    try {
      const data = await projectsAPI.getById(projectId);
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
      setError('Failed to load project details');
    }
  };

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksAPI.getByProject(projectId);
      setTasks(data);
      setError('');
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (status) => {
    if (!permissions.create_task) {
      setError('You do not have permission to create tasks');
      return;
    }

    if (!newTaskTitle.trim()) {
      return;
    }

    try {
      await tasksAPI.create(projectId, {
        title: newTaskTitle.trim(),
        status
      });
      setNewTaskColumn(null);
      setNewTaskTitle('');
      loadTasks();
      setError('');
    } catch (error) {
      console.error('Failed to create task:', error);
      setError(error.message || 'Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    if (!permissions.update_task) {
      setError('You do not have permission to update tasks');
      return;
    }

    try {
      await tasksAPI.update(projectId, taskId, updates);
      setEditingTask(null);
      loadTasks();
      setError('');
    } catch (error) {
      console.error('Failed to update task:', error);
      setError(error.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!permissions.delete_task) {
      setError('You do not have permission to delete tasks');
      return;
    }

    try {
      await tasksAPI.delete(projectId, taskId);
      setDeleteConfirm(null);
      loadTasks();
      setError('');
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError(error.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
    handleUpdateTask(taskId, { status: newStatus });
  };

  const startEditingTask = (task) => {
    setEditingTask({
      id: task.id,
      title: task.title
    });
  };

  const saveEditingTask = () => {
    if (editingTask && editingTask.title.trim()) {
      handleUpdateTask(editingTask.id, { title: editingTask.title.trim() });
    } else {
      setEditingTask(null);
    }
  };

  const cancelEditingTask = () => {
    setEditingTask(null);
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const getTaskCount = (status) => {
    return getTasksByStatus(status).length;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="task-board">
      <div className="board-header">
        <button className="back-btn" onClick={() => navigate('/projects')}>
          ← Back to Projects
        </button>
        <div className="project-info">
          <h1>{project?.name || 'Project'}</h1>
          {project?.description && (
            <p className="project-description">{project.description}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="kanban-board">
        {columns.map(column => {
          const columnTasks = getTasksByStatus(column.id);
          const taskCount = columnTasks.length;

          return (
            <div key={column.id} className="kanban-column">
              <div className="column-header" style={{ borderTopColor: column.color }}>
                <h3>{column.label}</h3>
                <span className="task-count" style={{ backgroundColor: column.color }}>
                  {taskCount}
                </span>
              </div>

              <div className="column-body">
                {columnTasks.length === 0 && newTaskColumn !== column.id && (
                  <div className="empty-column">
                    <p>No tasks yet</p>
                  </div>
                )}

                {columnTasks.map(task => (
                  <div key={task.id} className="task-card">
                    {deleteConfirm === task.id ? (
                      <div className="delete-confirmation">
                        <p>Delete this task?</p>
                        <div className="delete-actions">
                          <button
                            className="btn btn-cancel"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            Cancel
                          </button>
                          <button
                            className="btn btn-delete"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="task-content">
                          {editingTask?.id === task.id ? (
                            <input
                              type="text"
                              className="task-edit-input"
                              value={editingTask.title}
                              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  saveEditingTask();
                                } else if (e.key === 'Escape') {
                                  cancelEditingTask();
                                }
                              }}
                              onBlur={saveEditingTask}
                              autoFocus
                            />
                          ) : (
                            <h4 className="task-title">{task.title}</h4>
                          )}
                        </div>

                        <div className="task-actions">
                          <select
                            className="status-select"
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            disabled={!permissions.update_task}
                          >
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>

                          {permissions.update_task && editingTask?.id !== task.id && (
                            <button
                              className="action-icon-btn edit-btn"
                              onClick={() => startEditingTask(task)}
                              title="Edit task"
                            >
                              ✏️
                            </button>
                          )}

                          {permissions.delete_task && (
                            <button
                              className="action-icon-btn delete-btn"
                              onClick={() => setDeleteConfirm(task.id)}
                              title="Delete task"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {newTaskColumn === column.id && (
                  <div className="new-task-form">
                    <input
                      type="text"
                      className="new-task-input"
                      placeholder="Enter task title..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCreateTask(column.id);
                        } else if (e.key === 'Escape') {
                          setNewTaskColumn(null);
                          setNewTaskTitle('');
                        }
                      }}
                      autoFocus
                    />
                    <div className="new-task-actions">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleCreateTask(column.id)}
                      >
                        Add
                      </button>
                      <button
                        className="btn btn-cancel"
                        onClick={() => {
                          setNewTaskColumn(null);
                          setNewTaskTitle('');
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {newTaskColumn !== column.id && permissions.create_task && (
                <button
                  className="add-task-btn"
                  onClick={() => setNewTaskColumn(column.id)}
                >
                  + Add Task
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TaskBoard;
