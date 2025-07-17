import axios from "axios";
import store from "../redux/store";
import { fetchCurrentUser, logoutUser } from "../redux/store/auth/auth-actions";
import { setAccessToken, setUser } from "../redux/store/auth/auth-slice";

// Axios instance with optional baseURL for production
const axiosInstance = axios.create({
  baseURL:
    import.meta.env.MODE === "production"
      ? import.meta.env.VITE_API_URL
      : undefined, // no baseURL in dev (proxy handles it)
  withCredentials: true, // include cookies for refresh tokens etc.
});

// Attach access token from Redux to each request
axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// for refreshing access token
let isRefreshing = false; // Prevents multiple refresh requests in parallel.
type FailedRequest = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

let failedQueue: FailedRequest[] = []; // Holds all requests that failed with 401 while a refresh is in progress.

// If success, retries all queued requests with new token.
// If fail, rejects all queued requests with the error
const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!); // non-null assertion since token will be used if no error
  });
  failedQueue = [];
};

// Auto-refresh on 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Refresh Conditions
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/refresh-token") &&
      !originalRequest.url.includes("/login")
    ) {
      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const result = await store.dispatch(fetchCurrentUser());

        if (fetchCurrentUser.fulfilled.match(result)) {
          const { token, user } = result.payload;
          store.dispatch(setAccessToken(token));
          store.dispatch(setUser(user));

          processQueue(null, token);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        } else {
          throw new Error("Refresh failed");
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        store.dispatch(logoutUser());
        window.location.href = "/login";
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
