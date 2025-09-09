import axios from 'axios';

// Create axios instance with defaults
export const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle response errors - SERVER-SIDE SAFE
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    
    // Only handle client-side redirects and storage
    if (typeof window !== 'undefined') {
      // Handle specific HTTP errors
      if (response) {
        // Authentication errors
        if (response.status === 401) {
          localStorage.removeItem('token');
          if (window.location.pathname !== '/login' && 
              window.location.pathname !== '/register') {
            window.location.href = '/login';
          }
        }
      }
    }
    
    // Just log errors on server side, no toast calls
    console.error('API Error:', error.message);
    
    return Promise.reject(error);
  }
);