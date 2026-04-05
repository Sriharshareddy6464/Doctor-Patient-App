import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// Singleton refresh promise — prevents multiple concurrent 401 responses from
// each triggering their own /refresh-token call (race condition). All parallel
// requests that hit 401 share the same in-flight refresh promise.
let refreshPromise: Promise<{ accessToken: string; refreshToken?: string }> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    const axiosError = error as {
      config?: { _retry?: boolean; headers?: Record<string, string> };
      response?: { status?: number };
    };
    const originalRequest = axiosError.config;

    if (axiosError.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) throw new Error('No refresh token available');

          refreshPromise = axios
            .post(`${api.defaults.baseURL}/auth/refresh-token`, { refreshToken })
            .then((res) => res.data.data as { accessToken: string; refreshToken?: string })
            .finally(() => {
              refreshPromise = null;
            });
        }

        const data = await refreshPromise;
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        return api(originalRequest as Parameters<typeof api>[0]);
      } catch (refreshError) {
        refreshPromise = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Preserve the page the user was on so they can return after re-login
        const returnPath = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?returnTo=${returnPath}`;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
