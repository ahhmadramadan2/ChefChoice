import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("chefToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server says "token bad/expired", auto-logout
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("chefToken");
      localStorage.removeItem("chefUser");
    }
    return Promise.reject(err);
  }
);

export default api;