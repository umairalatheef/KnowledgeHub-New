import axios from "axios";
import useAuthStore from "../store/authStore";

const API = axios.create({
    baseURL: "http://127.0.0.1:8000/api/v1",
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": "true",
    },
    withCredentials: true, // Ensures JWT cookies are sent
});

// Request Interceptor: Attach Access Token
API.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().accessToken;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Expiry
API.interceptors.response.use(
    (response) => response, // Return response if no error
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const { refreshToken } = useAuthStore.getState();
                if (!refreshToken) {
                    console.warn("No refresh token found. Logging out...");
                    useAuthStore.getState().logout(); // Logout if no refresh token
                    return Promise.reject(error);
                }

                // Request a new access token
                const { data } = await axios.post(
                    "http://127.0.0.1:8000/api/v1/auth/token/refresh/",
                    { refresh: refreshToken }
                );

                // Update Zustand store with new access token
                useAuthStore.getState().setAccessToken(data.access);

                // Retry the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${data.access}`;
                return API(originalRequest);
            } catch (refreshError) {
                console.error("Token refresh failed. Logging out...", refreshError);
                useAuthStore.getState().logout(); // Force logout if refresh fails
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default API;
