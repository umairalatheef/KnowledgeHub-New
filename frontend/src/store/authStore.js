import { create } from "zustand";
import API from "../utils/axios";

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    isAuthenticated: !!localStorage.getItem("accessToken"),
    accessToken: localStorage.getItem("accessToken") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,

    //  Function to update access token separately (fixes axios issue)
    setAccessToken: (token) => {
        localStorage.setItem("accessToken", token);
        set({ accessToken: token });
    },

    // REGISTER FUNCTION (Auto-login after successful registration)
    register: async (userData) => {
        try {
            console.log("Registering user...");
            const response = await API.post("/auth/register/", userData);
            console.log("Registration successful:", response.data);

            //  Auto-login after registration
            await useAuthStore.getState().login(userData.username, userData.password);
            return response.data;
        } catch (error) {
            console.error("Registration failed:", error.response?.data || error.message);
            throw error;
        }
    },

    //  LOGIN FUNCTION
    login: async (username, password) => {
        try {
            console.log("Attempting login...");
            const response = await API.post("/auth/login/", { username, password });

            console.log("Login response:", response.data);

            if (response.data.access && response.data.refresh) {
                console.log("Tokens received, storing in localStorage...");
                localStorage.setItem("accessToken", response.data.access);
                localStorage.setItem("refreshToken", response.data.refresh);

                let userData = response.data.user;
                if (!userData.user_type) {
                    console.warn("🚨 Warning: user_type is missing! Fetching profile...");
                    userData = await useAuthStore.getState().fetchProfile();
                    // if (profileData && profileData.user_type) {
                    //     userData.user_type = profileData.user_type;
                    // }
                }

                localStorage.setItem("user", JSON.stringify(userData));

                set({
                    user: userData,
                    isAuthenticated: true,
                    accessToken: response.data.access,
                    refreshToken: response.data.refresh,
                });
                console.log(" Zustand Store Updated:", useAuthStore.getState().user);

                // Fetch Full Profile After Login
                await useAuthStore.getState().fetchProfile();
            } else {
                console.error("Login failed: No tokens received");
            }
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            alert("Login Failed: " + (error.response?.data?.detail || error.message));
            throw error;
        }
    },

    //  Fetch the logged-in user's profile
    fetchProfile: async () => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return null;

            // Determine the correct profile endpoint based on user type
            let storedUser = JSON.parse(localStorage.getItem("user")) || {};
            let profileEndpoint = storedUser.user_type === "admin"
                ? "/auth/admin/profile/"
                : "/auth/student/profile/";

            console.log(`Fetching profile from: ${profileEndpoint}`);
            const response = await API.get(profileEndpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log("Profile fetched successfully:", response.data);

            //  Ensure user_type is properly stored
            // if (!response.data.user_type) {
            //     console.warn(" user_type missing in profile response!");
            // } else {
            //     console.log(" user_type received:", response.data.user_type);
            // }

            //  Ensure user_type is stored
            //Manually merge `user_type` from stored user
            let updatedUser = {
                ...response.data,
                user_type: storedUser.user_type, // Ensure `user_type` is not lost
                signed_url: response.data.signed_url ? `${response.data.signed_url}&timestamp=${new Date().getTime()}` : null,
            };
            console.log("Updated User Signed URL:", updatedUser.signed_url); 
            localStorage.setItem("user", JSON.stringify(updatedUser));
            set({ user: updatedUser });

            return updatedUser;
        } catch (error) {
            console.error("Failed to fetch profile:", error.response?.data || error.message);
            return null;
        }
    },

    //  Update user profile globally
    updateProfile: async (profileData) => {
        try {
            const token = localStorage.getItem("accessToken");
            if (!token) return;

            // Determine correct profile update endpoint
            const storedUser = JSON.parse(localStorage.getItem("user"));
            // if (!storedUser || !storedUser.user_type) {
            //     console.warn("User type not found, skipping profile update.");
            //     return;
            // }

            const profileEndpoint = storedUser.user_type === "admin"
                ? "/auth/admin/profile/"
                : "/auth/student/profile/";

            console.log(`Updating profile at: ${profileEndpoint}`);

            const response = await API.put(profileEndpoint, profileData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            console.log("Profile updated successfully:", response.data);

            // Fetch and store the updated profile immediately after update
            const updatedProfile = await useAuthStore.getState().fetchProfile();
            
            //Store updated `signed_url` in localStorage
            if (updatedProfile?.signed_url) {
                updatedProfile.signed_url = `${updatedProfile.signed_url}&timestamp=${new Date().getTime()}`;
                localStorage.setItem("user", JSON.stringify(updatedProfile));
                set({ user: updatedProfile });
            }

            return updatedProfile;
        } catch (error) {
            console.error("Failed to update profile:", error.response?.data || error.message);
            throw error;
        }
    },

    // LOGOUT FUNCTION (Clears tokens & user data)
    logout: () => {
        console.log("Logging out user...");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");

        set({ user: null, isAuthenticated: false, accessToken: null, refreshToken: null });
        console.log("Logout successful!");
    },

    // REFRESH TOKEN FUNCTION
    refreshAccessToken: async () => {
        try {
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
                console.warn("No refresh token found. Logging out...");
                return useAuthStore.getState().logout();
            }

            const { data } = await API.post("/auth/token/refresh/", { refresh: refreshToken });

            //  Update access token using Zustand
            useAuthStore.getState().setAccessToken(data.access);

            console.log("Access token refreshed successfully!");
            
            // Fetch and store updated user profile after refreshing token
            await useAuthStore.getState().fetchProfile();
            return data.access; // Return new access token
        } catch (error) {
            console.error("Failed to refresh token:", error.response?.data || error.message);
            useAuthStore.getState().logout(); // Force logout on failure
        }
    },

    //Add this function
    setUser: (userData) => {
        localStorage.setItem("user", JSON.stringify(userData));  //Ensure localStorage is updated
        set({ user: { ...userData, signed_url: userData.signed_url} });
        console.log("Zustand store updated:", userData);
    }
}));

export default useAuthStore;
