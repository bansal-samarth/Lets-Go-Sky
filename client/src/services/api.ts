import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Retrieve the API URL from environment variables
// NEXT_PUBLIC_ prefix is required for variables to be exposed to the browser in Next.js
const API_BASE_URL: string = 'http://localhost:5000/api';

// Create an Axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check if window is defined (i.e., running in the browser) before accessing localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response interceptor for handling global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors, e.g., redirect to login
      // This might be better handled in AuthContext or specific components
      // to avoid circular dependencies or direct router usage here.
      console.error('API: Unauthorized access - 401');
      if (typeof window !== 'undefined') {
        // Consider triggering a logout action from AuthContext instead of direct manipulation
        // localStorage.removeItem('token');
        // localStorage.removeItem('user');
        // window.location.href = '/login'; // Or use Next.js router if accessible
      }
    }
    return Promise.reject(error);
  }
);

export default api;