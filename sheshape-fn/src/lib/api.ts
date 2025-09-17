// src/lib/api.ts
import axios from 'axios';

// Create axios instance with defaults
export const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // Log request for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token management
api.interceptors.response.use(
  (response) => {
    // Log successful response for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    const { response, request, config } = error;
    
    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${config?.method?.toUpperCase()} ${config?.url}`, {
        status: response?.status,
        data: response?.data,
        message: error.message,
      });
    }
    
    // Only handle client-side specific logic
    if (typeof window !== 'undefined') {
      if (response) {
        // Handle specific HTTP status codes
        switch (response.status) {
          case 401:
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            
            // Only redirect if not already on auth pages
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/login') && 
                !currentPath.includes('/register') && 
                !currentPath.includes('/forgot-password')) {
              window.location.href = '/login';
            }
            break;
            
          case 403:
            // Forbidden - user doesn't have permission
            console.error('Access forbidden - insufficient permissions');
            break;
            
          case 404:
            // Not found - log for debugging
            console.warn('Resource not found:', config?.url);
            break;
            
          case 429:
            // Too many requests - rate limited
            console.error('Rate limited - too many requests');
            break;
            
          case 500:
          case 502:
          case 503:
          case 504:
            // Server errors
            console.error('Server error:', response.status);
            break;
        }
      } else if (request) {
        // Network error (no response received)
        console.error('Network error - no response received');
      } else {
        // Request configuration error
        console.error('Request configuration error:', error.message);
      }
    }
    
    // Always reject the promise so calling code can handle the error
    return Promise.reject(error);
  }
);

// Helper function to check if backend is reachable
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
};

// Helper function to refresh auth token
export const refreshAuthToken = async (): Promise<string | null> => {
  try {
    const response = await api.post('/api/auth/refresh');
    const newToken = response.data.token;
    
    if (newToken) {
      localStorage.setItem('token', newToken);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    }
    
    return newToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return null;
  }
};

// Helper function to clear auth
export const clearAuth = (): void => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

// Export default api instance
export default api;