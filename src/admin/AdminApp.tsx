import "./adminindex.css";
import "./AdminApp.css";
// ------------------------------

import { Toaster } from "@shared/components/ui/toaster";
import { Toaster as Sonner } from "@shared/components/ui/sonner";
import { TooltipProvider } from "@shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";

// Admin Pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import Analytics from "./pages/Analytics";
import Knowledge from "./pages/Knowledge";

// Event Pages
import Events from "./pages/Events";
import EventCreate from "./pages/EventCreate";
import EventDetail from "./pages/EventDetail";
import EventBookings from "./pages/EventBookings";  // ← NEW

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AdminApp = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <Routes>
          {/* Public Auth Routes */}
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />

          {/* Protected Admin Routes */}
          <Route
            path=""
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="bookings" element={<Bookings />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="knowledge" element={<Knowledge />} />

            {/* Event Routes */}
            <Route path="events" element={<Events />} />
            <Route path="events/create" element={<EventCreate />} />
            <Route path="events/bookings" element={<EventBookings />} />   {/* ← NEW — must be before :id */}
            <Route path="events/:id" element={<EventDetail />} />
            <Route path="events/edit/:id" element={<EventCreate />} />
          </Route>

          {/* Catch all - 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default AdminApp;