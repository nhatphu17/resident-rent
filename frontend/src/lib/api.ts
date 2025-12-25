import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration and connection errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle connection errors
    if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
      console.error('Cannot connect to backend server. Make sure backend is running on port 3000.');
      // Don't redirect on connection errors, let the component handle it
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;


