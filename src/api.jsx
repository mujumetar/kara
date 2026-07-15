import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://kara-8bl6.vercel.app", // replace with your backend
});

// Helper function to generate cURL command
const generateCurlCommand = (config) => {
  const method = config.method?.toUpperCase() || 'GET';
  const baseURL = config.baseURL?.replace(/\/$/, '') || '';
  const urlPath = config.url?.replace(/^\//, '') || '';
  // If url is absolute, don't prepend baseURL
  const url = config.url?.startsWith('http') ? config.url : `${baseURL}/${urlPath}`;
  
  let curl = `curl -X ${method} '${url}'`;

  if (config.headers) {
    Object.entries(config.headers).forEach(([key, value]) => {
      const ignoreHeaders = ['common', 'delete', 'get', 'head', 'post', 'put', 'patch'];
      if (!ignoreHeaders.includes(key.toLowerCase()) && value) {
         curl += ` \\\n  -H '${key}: ${value}'`;
      }
    });
  }

  if (config.data) {
    const dataString = typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
    curl += ` \\\n  -d '${dataString}'`;
  }

  return curl;
};

// Attach token automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Log cURL command in development mode
  if (import.meta.env.MODE !== 'production') {
    console.log(`🚀 [API Request] cURL:\n${generateCurlCommand(config)}\n\n`);
  }

  return config;
});

export default API;
