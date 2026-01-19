// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000",
// });

// /* 🔐 Attach token automatically */
// API.interceptors.request.use((req) => {
//   const token = localStorage.getItem("token");
//   if (token) {
//     req.headers.Authorization = token;
//   }
//   return req;
// });

// /* 🚪 Auto logout on auth failure */
// API.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err.response?.status === 401) {
//       localStorage.removeItem("token");
//       window.location.reload();
//     }
//     return Promise.reject(err);
//   }
// );

// export default API;
