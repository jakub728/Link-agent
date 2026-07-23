import axios from "axios";

const api = axios.create({
  baseURL: "https://ai.sulisz.pl",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("user_session");

      const publicPaths = ["/login", "/privacy_policie", "/privacy-policy"];

      const isPublicPath = publicPaths.some((path) =>
        window.location.pathname.includes(path),
      );

      if (!isPublicPath) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
