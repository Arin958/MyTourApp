import { Route, Routes } from "react-router-dom";

import AppLayout from "../layout/Applayout";
import AdminLayout from "../layout/AdminLayout";
import Home from "../pages/Home";
import SignUp from "../pages/auth/SignUp";
import Signin from "../pages/auth/Signin";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import Tours from "../pages/Admin/tours/Tours";
import RoleProtectedRoute from "../components/auth/RoleProtectedRoute";
import Users from "../pages/Admin/users/Users";
import Bookings from "../pages/Admin/bookings/Booking";
import TourCreate from "../pages/Admin/TourCreate";
import TourDetails from "../components/Tour/TourDetail";
import PublicRoute from "../components/PublicRoute";
import BookingPage from "../pages/Booking/BookingPage";
import AdminRoute from "../components/ProtectedAdminRoutes";
import ResetFlow from "../components/Email/ResetFlow";

const Routers = () => {
  return (
    <Routes>
      {/* Public Layout */}
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="signup" element={<SignUp />} />
        <Route
          path="signin"
          element={
            <PublicRoute>
              <Signin />
            </PublicRoute>
          }
        />
        <Route path="tours/:slug" element={<TourDetails />} />
        <Route path="/bookings" element={<BookingPage />} />
        <Route path="/forgot-password" element={<ResetFlow />} />
      </Route>

      {/* Optional Unauthorized Route */}
      <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />

      {/* Protected Admin Layout */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="tours" element={<Tours />} />
          <Route path="users" element={<Users />} />
          <Route path="tours/create" element={<TourCreate />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default Routers;
