import React, { createContext, useContext, useState, useEffect } from 'react';
import { projectAPI, taskAPI } from '../services/api.js';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getAll();

      if (response.success) {
        setProjects(response.data);
        setError(null);
      } else {
        throw new Error(response.message || 'Failed to fetch projects');
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message);
      setProjects([]); // Clear projects on error
    } finally {
      setLoading(false);
    }
  };

  // Load projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Add new project
  const addProject = async (projectData) => {
    try {
      const response = await projectAPI.create(projectData);

      if (response.success) {
        setProjects(prev => [response.data, ...prev]);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create project');
      }
    } catch (err) {
      console.error('Error creating project:', err);
      throw err;
    }
  };

  // Update existing project
  const updateProject = async (projectId, updates) => {
    try {
      const response = await projectAPI.update(projectId, updates);

      if (response.success) {
        setProjects(prev =>
          prev.map(p => (p.id === projectId ? response.data : p))
        );
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update project');
      }
    } catch (err) {
      console.error('Error updating project:', err);
      throw err;
    }
  };

  // Delete project
  const deleteProject = async (projectId) => {
    try {
      const response = await projectAPI.delete(projectId);

      if (response.success) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } else {
        throw new Error(response.message || 'Failed to delete project');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
      throw err;
    }
  };

  // Add task to project
  const addTask = async (projectId, taskData) => {
    try {
      const response = await taskAPI.create(projectId, taskData);

      if (response.success) {
        // Refresh projects to get updated task counts
        await fetchProjects();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create task');
      }
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  // Update task
  const updateTask = async (projectId, taskId, updates) => {
    try {
      const response = await taskAPI.update(projectId, taskId, updates);

      if (response.success) {
        // Refresh projects to get updated task data
        await fetchProjects();
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update task');
      }
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  // Delete task
  const deleteTask = async (projectId, taskId) => {
    try {
      const response = await taskAPI.delete(projectId, taskId);

      if (response.success) {
        // Refresh projects to get updated task counts
        await fetchProjects();
      } else {
        throw new Error(response.message || 'Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  // Calculate statistics
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    totalTasks: projects.reduce((sum, p) => sum + (p.totalTasks || 0), 0),
    completedTasks: projects.reduce((sum, p) => sum + (p.completedTasks || 0), 0),
    progressPercentage: function() {
      if (this.totalTasks === 0) return 0;
      return Math.round((this.completedTasks / this.totalTasks) * 100);
    }
  };

  const value = {
    projects,
    loading,
    error,
    stats,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
    addTask,
    updateTask,
    deleteTask
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export default DataContext;
