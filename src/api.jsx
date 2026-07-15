import axios from "axios";

const API = axios.create({
  baseURL: "https://kara-8bl6.vercel.app", // replace with your backend
});

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;
