import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach token to every request automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle global response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || "Something went wrong";

        // Auto logout if token expired
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/login";
        }

        return Promise.reject({ message });
    }
);

export default api;