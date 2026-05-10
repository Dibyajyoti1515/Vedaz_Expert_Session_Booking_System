import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,

            // Register
            register: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await api.post("/auth/register", data);
                    localStorage.setItem("token", res.data.token);
                    set({
                        user: res.data.user,
                        token: res.data.token,
                        isLoading: false,
                    });
                    return { success: true };
                } catch (error) {
                    set({ isLoading: false, error: error.message });
                    return { success: false, message: error.message };
                }
            },

            // Login
            login: async (data) => {
                set({ isLoading: true, error: null });
                try {
                    const res = await api.post("/auth/login", data);
                    localStorage.setItem("token", res.data.token);
                    set({
                        user: res.data.user,
                        token: res.data.token,
                        isLoading: false,
                    });
                    return { success: true };
                } catch (error) {
                    set({ isLoading: false, error: error.message });
                    return { success: false, message: error.message };
                }
            },

            // Logout
            logout: () => {
                localStorage.removeItem("token");
                set({ user: null, token: null });
            },

            // Clear error
            clearError: () => set({ error: null }),
        }),
        {
            name: "auth-storage",        // key in localStorage
            partialize: (state) => ({    // only persist these fields
                user: state.user,
                token: state.token,
            }),
        }
    )
);

export default useAuthStore;