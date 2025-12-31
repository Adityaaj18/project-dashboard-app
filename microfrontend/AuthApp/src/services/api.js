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
