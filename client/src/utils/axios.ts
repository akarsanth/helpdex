import axios from "axios";
import store from "../redux/store";

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

export default axiosInstance;
