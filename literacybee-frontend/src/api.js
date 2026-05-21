import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
});

// allow sending cookies (httpOnly refresh token)
api.defaults.withCredentials = true;

// Attach access token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: if access token expired (401), try refresh token and retry once
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const authRetryBlockedPaths = [
      '/auth/login',
      '/auth/child/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/resend-verification',
      '/auth/forgot-password',
      '/auth/reset-password',
      '/auth/verify-email',
      '/auth/logout'
    ];
    const shouldSkipRefresh = authRetryBlockedPaths.some((path) => originalRequest.url?.includes(path));

    if (error.response && error.response.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      originalRequest._retry = true;
      try {
        const resp = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const { accessToken } = resp.data;
        if (accessToken) {
          localStorage.setItem('token', accessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (e) {
        localStorage.removeItem('token');
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
