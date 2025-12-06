import axios from 'axios';

// Create axios instance for public API calls (no authentication required)
const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor - NO 401 redirect for public endpoints
publicApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Just reject the error without redirecting
    // Let the calling component handle the error
    return Promise.reject(error);
  }
);

export default publicApi;
