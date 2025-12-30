import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Projects.css';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  const [error, setError] = useState('');
  const { user, permissions } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectsAPI.getAll();
      setProjects(data);
      setError('');
    } catch (error) {
      console.error('Failed to load projects:', error);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!permissions.create_project) {
      setError('You do not have permission to create projects');
      return;
    }

    try {
      await projectsAPI.create(formData);
      setShowModal(false);
      setFormData({ name: '', description: '', status: 'active' });
      loadProjects();
      setError('');
    } catch (error) {
      console.error('Failed to create project:', error);
      setError(error.message || 'Failed to create project');
    }
  };

  const handleUpdateProject = async (projectId, updates) => {
    if (!permissions.update_project) {
      setError('You do not have permission to update projects');
      return;
    }

    try {
      await projectsAPI.update(projectId, updates);
      setEditingProject(null);
      loadProjects();
      setError('');
    } catch (error) {
      console.error('Failed to update project:', error);
      setError(error.message || 'Failed to update project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!permissions.delete_project) {
      setError('You do not have permission to delete projects');
      return;
    }

    try {
      await projectsAPI.delete(projectId);
      setDeleteConfirm(null);
      loadProjects();
      setError('');
    } catch (error) {
      console.error('Failed to delete project:', error);
      setError(error.message || 'Failed to delete project');
    }
  };

  const handleEditToggle = (project) => {
    if (editingProject?.id === project.id) {
      setEditingProject(null);
    } else {
      setEditingProject({
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: project.status
      });
    }
  };

  const handleEditChange = (field, value) => {
    setEditingProject({
      ...editingProject,
      [field]: value
    });
  };

  const handleEditSave = (projectId) => {
    const { id, ...updates } = editingProject;
    handleUpdateProject(projectId, updates);
  };

  const getProgressPercentage = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const openCreateModal = () => {
    if (!permissions.create_project) {
      setError('You do not have permission to create projects');
      return;
    }
    setShowModal(true);
    setError('');
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', description: '', status: 'active' });
    setError('');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="projects">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-description">Manage your projects and track progress</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          + Create Project
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <h3>No Projects Yet</h3>
          <p>Create your first project to get started!</p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(project => {
            const projectProgress = getProgressPercentage(project.completed_tasks, project.task_count);
            const isEditing = editingProject?.id === project.id;
            const isDeleting = deleteConfirm === project.id;

            return (
              <div key={project.id} className="project-card">
                {isDeleting ? (
                  <div className="delete-confirmation">
                    <h3>Delete Project?</h3>
                    <p>Are you sure you want to delete "{project.name}"? This action cannot be undone.</p>
                    <div className="delete-actions">
                      <button
                        className="btn btn-cancel"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-delete"
                        onClick={() => handleDeleteProject(project.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : isEditing ? (
                  <div className="edit-form">
                    <div className="form-group">
                      <label>Project Name</label>
                      <input
                        type="text"
                        value={editingProject.name}
                        onChange={(e) => handleEditChange('name', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={editingProject.description}
                        onChange={(e) => handleEditChange('description', e.target.value)}
                        rows="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={editingProject.status}
                        onChange={(e) => handleEditChange('status', e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="on-hold">On Hold</option>
                      </select>
                    </div>
                    <div className="edit-actions">
                      <button
                        className="btn btn-cancel"
                        onClick={() => setEditingProject(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleEditSave(project.id)}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="project-content"
                      onClick={() => navigate(`/projects/${project.id}/tasks`)}
                    >
                      <div className="project-header">
                        <h3>{project.name}</h3>
                        <span className={`status-badge status-${project.status}`}>
                          {project.status}
                        </span>
                      </div>

                      {project.description && (
                        <p className="project-description">{project.description}</p>
                      )}

                      <div className="project-stats">
                        <div className="project-stat">
                          <span className="stat-icon">📝</span>
                          <span>{project.task_count || 0} tasks</span>
                        </div>
                        <div className="project-stat">
                          <span className="stat-icon">✅</span>
                          <span>{project.completed_tasks || 0} completed</span>
                        </div>
                      </div>

                      <div className="project-progress">
                        <div className="progress-label">
                          <span>Progress</span>
                          <span>{projectProgress}%</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${projectProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="project-footer">
                        <span className="project-owner">👤 {project.owner_name}</span>
                      </div>
                    </div>

                    <div className="project-actions">
                      {permissions.update_project && (
                        <button
                          className="action-btn edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditToggle(project);
                          }}
                          title="Edit project"
                        >
                          ✏️
                        </button>
                      )}
                      {permissions.delete_project && (
                        <button
                          className="action-btn delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirm(project.id);
                          }}
                          title="Delete project"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label htmlFor="name">Project Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="What is this project about?"
                />
              </div>
              <div className="form-group">
                <label htmlFor="status">Status *</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Projects;
