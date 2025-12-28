import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auto-refresh and errors
api.interceptors.response.use(
  (response) => {
    // Check if the token was auto-refreshed by the backend middleware
    if (response.headers['x-token-refreshed'] === 'true') {
      const authHeader = response.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const newToken = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Store the new token
        localStorage.setItem('jwt_token', newToken);

        console.log('Token auto-refreshed successfully');

        // Dispatch custom event for other parts of the app
        window.dispatchEvent(new CustomEvent('token-refreshed', {
          detail: { token: newToken }
        }));
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const message = error.response.data?.message || '';

      // Check if token expired and cannot be refreshed
      if (message.includes('expired and cannot be refreshed') ||
          message.includes('Token is invalid')) {
        console.log('Session expired. Redirecting to login...');

        // Clear stored tokens
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('mitel_token');
        localStorage.removeItem('user-session');

        // Redirect to login page
        window.location.href = '/agent-login';
      } else {
        // Other 401 errors (invalid token, etc.)
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('mitel_token');
        localStorage.removeItem('user-session');
        window.location.href = '/agent-login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
