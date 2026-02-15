import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/",
  withCredentials: true,
});

let sessionToastShown = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {

      const wasLoggedIn = localStorage.getItem("wasLoggedIn");

      // ✅ Sirf tab toast jab user pehle login tha
      if (wasLoggedIn && !sessionToastShown) {
        toast.error("Session expired. Please login again.");
        sessionToastShown = true;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
