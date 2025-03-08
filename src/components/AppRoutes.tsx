
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Sources from "@/pages/Sources";
import Transformations from "@/pages/Transformations";
import Destinations from "@/pages/Destinations";
import Jobs from "@/pages/Jobs";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import ApiKeys from "@/pages/settings/ApiKeys";
import Webhooks from "@/pages/settings/Webhooks";
import Profile from "@/pages/settings/Profile";
import Users from "@/pages/settings/Users";
import ProtectedRoute from "./ProtectedRoute";
import AuthCallback from "@/pages/AuthCallback";

const AppRoutes = () => {
  const { user } = useAuth();
  
  // Handler functions for Login and Register components
  const handleLogin = () => {
    console.log("Login successful");
  };
  
  const handleRegister = () => {
    console.log("Registration successful");
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login onLogin={handleLogin} />} />
      <Route path="/register" element={<Register onRegister={handleRegister} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="/transformations" element={<Transformations />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/settings" element={<Settings />} />

        {/* Settings sub-routes */}
        <Route path="/settings/api-keys" element={<ApiKeys />} />
        <Route path="/settings/webhooks" element={<Webhooks />} />
        <Route path="/settings/profile" element={<Profile />} />
        {/* Admin only routes */}
        {user?.role === 'admin' && (
          <Route path="/settings/users" element={<Users />} />
        )}
        
        <Route path="/help" element={<Help />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
