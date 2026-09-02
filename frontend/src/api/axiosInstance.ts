import axios from 'axios';

let memoryAccessToken: string | null = null;

export const setMemoryAccessToken = (token: string | null) => {
  memoryAccessToken = token;
};

export const getMemoryAccessToken = () => memoryAccessToken;

export const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Send HttpOnly refresh cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach memory Access Token
api.interceptors.request.use(
  (config) => {
    if (memoryAccessToken) {
      config.headers['Authorization'] = `Bearer ${memoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto Refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const skipRefreshRoutes = ['/auth/login', '/auth/refresh', '/auth/login/verify-2fa', '/auth/register'];

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !skipRefreshRoutes.includes(originalRequest.url)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );

        if (data?.accessToken) {
          setMemoryAccessToken(data.accessToken);
          processQueue(null, data.accessToken);
          originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        setMemoryAccessToken(null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
