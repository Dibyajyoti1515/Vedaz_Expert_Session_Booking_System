import { create } from "zustand";
import api from "../services/api";

const useBookingStore = create((set) => ({
    bookings: [],
    isLoading: false,
    error: null,

    // Create booking
    createBooking: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post("/bookings", data);
            set({ isLoading: false });
            return { success: true, data: res.data };
        } catch (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, message: error.message };
        }
    },

    // Get my bookings by email
    getMyBookings: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get(`/bookings?email=${email}`);
            set({ bookings: res.data.data, isLoading: false });
        } catch (error) {
            set({ isLoading: false, error: error.message });
        }
    },

    // Update booking status (admin)
    updateBookingStatus: async (id, status) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.patch(`/bookings/${id}/status`, { status });
            set((state) => ({
                bookings: state.bookings.map((b) =>
                    b._id === id ? { ...b, status: res.data.data.status } : b
                ),
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, message: error.message };
        }
    },

    // Clear error
    clearError: () => set({ error: null }),
}));

export default useBookingStore;