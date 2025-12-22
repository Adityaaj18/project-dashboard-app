const API_BASE_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      return parsed.token;
    } catch (e) {
      return null;
    }
  }
  return null;
};

// Helper function to make authenticated requests
const fetchWithAuth = async (url, options = {}) => {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
};

// Project APIs
export const projectAPI = {
  getAll: () => fetchWithAuth('/projects'),
  getById: (id) => fetchWithAuth(`/projects/${id}`),
  create: (projectData) => fetchWithAuth('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData),
  }),
  update: (id, updates) => fetchWithAuth(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  delete: (id) => fetchWithAuth(`/projects/${id}`, {
    method: 'DELETE',
  }),
};

// Task APIs
export const taskAPI = {
  getAll: (projectId) => fetchWithAuth(`/projects/${projectId}/tasks`),
  create: (projectId, taskData) => fetchWithAuth(`/projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(taskData),
  }),
  update: (projectId, taskId, updates) => fetchWithAuth(`/projects/${projectId}/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  delete: (projectId, taskId) => fetchWithAuth(`/projects/${projectId}/tasks/${taskId}`, {
    method: 'DELETE',
  }),
};

// Auth APIs
export const authAPI = {
  register: (userData) => fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  }).then(res => res.json()),

  login: (credentials) => fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  }).then(res => res.json()),

  getProfile: () => fetchWithAuth('/auth/profile'),

  updateProfile: (updates) => fetchWithAuth('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
};
