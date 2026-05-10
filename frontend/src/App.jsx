import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./store/authStore";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import HomePage from "./pages/HomePage";
import ExpertDetailPage from "./pages/ExpertDetailPage";
import BookingPage from "./pages/BookingPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AuthSuccessPage from "./pages/AuthSuccessPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminExperts from "./pages/admin/AdminExperts";
import AdminAddExpert from "./pages/admin/AdminAddExpert";
import AdminBookings from "./pages/admin/AdminBookings";

const App = () => {
  const { user } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/experts/:id" element={<ExpertDetailPage />} />
        <Route path="/auth/success" element={<AuthSuccessPage />} />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/register"
          element={!user ? <RegisterPage /> : <Navigate to="/" />}
        />

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/experts" element={<AdminExperts />} />
          <Route path="/admin/experts/add" element={<AdminAddExpert />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;