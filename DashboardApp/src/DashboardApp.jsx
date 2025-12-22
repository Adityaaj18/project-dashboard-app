import React, { useState } from 'react';
import './DashboardApp.css';

const DashboardApp = ({ dataContext }) => {
  // Fallback mock data for standalone mode
  const [mockData] = useState({
    projects: [
      {
        id: 1,
        name: 'Component Library',
        description: 'Reusable UI components for the microfrontend ecosystem',
        totalTasks: 15,
        completedTasks: 12,
        status: 'active'
      },
      {
        id: 2,
        name: 'Todo Application',
        description: 'Task management system with add/delete functionality',
        totalTasks: 8,
        completedTasks: 8,
        status: 'completed'
      },
      {
        id: 3,
        name: 'Dashboard App',
        description: 'Central monitoring and analytics dashboard',
        totalTasks: 10,
        completedTasks: 3,
        status: 'active'
      },
      {
        id: 4,
        name: 'Host Application',
        description: 'Main application integrating all microfrontends',
        totalTasks: 20,
        completedTasks: 18,
        status: 'active'
      }
    ]
  });

  // Use data from context if available, otherwise fall back to mock data
  const projects = dataContext?.projects || mockData.projects;
  const stats = dataContext?.stats || {
    totalProjects: mockData.projects.length,
    activeProjects: mockData.projects.filter(p => p.status === 'active').length,
    totalTasks: mockData.projects.reduce((sum, p) => sum + p.totalTasks, 0),
    completedTasks: mockData.projects.reduce((sum, p) => sum + p.completedTasks, 0),
    progressPercentage: function() {
      if (this.totalTasks === 0) return 0;
      return Math.round((this.completedTasks / this.totalTasks) * 100);
    }
  };
  const loading = dataContext?.loading || false;

  const calculateProgress = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const overallProgress = stats.progressPercentage();

  if (loading) {
    return (
      <div className="dashboard-app">
        <div className="dashboard-header">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-app">
      <div className="dashboard-header">
        <h2>Project Dashboard</h2>
        <p>Monitor your microfrontend projects and task progress</p>
      </div>

      <div className="dashboard-summary">
        <div className="summary-card">
          <div className="summary-value">{stats.totalProjects}</div>
          <div className="summary-label">Total Projects</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{stats.activeProjects}</div>
          <div className="summary-label">Active Projects</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{stats.totalTasks}</div>
          <div className="summary-label">Total Tasks</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{stats.completedTasks}</div>
          <div className="summary-label">Completed Tasks</div>
        </div>
      </div>

      <div className="overall-progress-section">
        <h3>Overall Progress</h3>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${overallProgress}%` }}>
            <span className="progress-text">{overallProgress}%</span>
          </div>
        </div>
        <div className="progress-details">
          {stats.completedTasks} of {stats.totalTasks} tasks completed
        </div>
      </div>

      <div className="projects-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <h3>No projects yet</h3>
            <p>Start by creating your first project</p>
          </div>
        ) : (
          projects.map(project => {
            const progress = calculateProgress(project.completedTasks, project.totalTasks);
            return (
              <div key={project.id} className="project-card">
                <div className="project-header">
                  <h3>{project.name}</h3>
                  <span className={`status-badge ${project.status}`}>
                    {project.status}
                  </span>
                </div>
                <p className="project-description">{project.description}</p>

                <div className="project-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Tasks:</span>
                    <span className="stat-value">{project.totalTasks}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Completed:</span>
                    <span className="stat-value">{project.completedTasks}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Remaining:</span>
                    <span className="stat-value">{project.totalTasks - project.completedTasks}</span>
                  </div>
                </div>

                <div className="progress-section">
                  <div className="progress-header">
                    <span>Progress</span>
                    <span className="progress-percentage">{progress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DashboardApp;
