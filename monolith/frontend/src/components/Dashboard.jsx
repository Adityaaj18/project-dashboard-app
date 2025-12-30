import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectsAPI.getAll();
      setProjects(data);

      // Calculate stats
      const totalProjects = data.length;
      const activeProjects = data.filter(p => p.status === 'active').length;
      const totalTasks = data.reduce((sum, p) => sum + (p.task_count || 0), 0);
      const completedTasks = data.reduce((sum, p) => sum + (p.completed_tasks || 0), 0);

      setStats({
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks
      });
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const overallProgress = getProgressPercentage(stats.completedTasks, stats.totalTasks);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-description">Welcome back, {user?.name}!</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
            📊
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalProjects}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            ✅
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeProjects}</div>
            <div className="stat-label">Active Projects</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>
            📝
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalTasks}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            🎯
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.completedTasks}</div>
            <div className="stat-label">Completed Tasks</div>
          </div>
        </div>
      </div>

      <div className="progress-section">
        <h2>Overall Progress</h2>
        <div className="progress-card">
          <div className="progress-header">
            <span>Task Completion</span>
            <span className="progress-percentage">{overallProgress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
          <div className="progress-info">
            {stats.completedTasks} of {stats.totalTasks} tasks completed
          </div>
        </div>
      </div>

      <div className="projects-section">
        <div className="section-header">
          <h2>Recent Projects</h2>
          <button className="btn btn-primary" onClick={() => navigate('/projects')}>
            View All Projects
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3>No Projects Yet</h3>
            <p>Create your first project to get started!</p>
            <button className="btn btn-primary" onClick={() => navigate('/projects')}>
              Create Project
            </button>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.slice(0, 6).map(project => {
              const projectProgress = getProgressPercentage(project.completed_tasks, project.task_count);

              return (
                <div
                  key={project.id}
                  className="project-card"
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
