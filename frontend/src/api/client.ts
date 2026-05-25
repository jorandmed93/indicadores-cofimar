import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Inject JWT Authorization header on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('cofimar-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Handle 401/403 responses (session expired or insufficient permissions)
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — force logout
      localStorage.removeItem('cofimar-token');
      localStorage.removeItem('cofimar-user');
      window.dispatchEvent(new CustomEvent('cofimar-session-expired'));
    }
    return Promise.reject(error);
  }
);

export default client;
export { API_BASE_URL };
