
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import AuthCallback from "@/pages/AuthCallback";
import Dashboard from "@/pages/Dashboard";
import Sources from "@/pages/Sources";
import Transformations from "@/pages/Transformations";
import Destinations from "@/pages/Destinations";
import Jobs from "@/pages/Jobs";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";
import Profile from "@/pages/settings/Profile";
import ApiKeys from "@/pages/settings/ApiKeys";
import Users from "@/pages/settings/Users";
import Webhooks from "@/pages/settings/Webhooks";
import Help from "@/pages/Help";
import Storage from "@/pages/Storage";
import Notifications from "@/pages/Notifications";
import ProtectedRoute from "@/components/ProtectedRoute";
import MyDatasets from "@/pages/MyDatasets";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="/my-datasets" element={<MyDatasets />} />
        <Route path="/transform" element={<Transformations />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/settings/profile" element={<Profile />} />
        <Route path="/settings/api-keys" element={<ApiKeys />} />
        <Route path="/settings/users" element={<Users />} />
        <Route path="/settings/webhooks" element={<Webhooks />} />
        <Route path="/help" element={<Help />} />
        <Route path="/storage" element={<Storage />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
