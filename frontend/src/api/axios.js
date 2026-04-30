import axios from 'axios';

/**
 * API base URL:
 * - Prefer VITE_API_URL when set (build-time).
 * - Else derive from current host + backend port 3579 so EC2/prod works without rebuilding
 *   (avoids frontend calling localhost while the page is served from the server IP).
 */
function getApiBase() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && String(envUrl).trim()) {
    return String(envUrl).trim();
  }
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3579`;
  }
  return 'http://localhost:3579';
}

const API_BASE = getApiBase();

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
