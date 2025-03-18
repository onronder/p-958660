
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import Sources from "@/Sources";
import Jobs from "@/pages/Jobs";
import Profile from "@/pages/Profile";
import ProtectedRoute from "./ProtectedRoute";
import MyDatasets from "@/pages/MyDatasets";
import CreateDatasetPage from "@/pages/CreateDatasetPage";
import DashboardLoadingSkeleton from "./DashboardLoadingSkeleton";

// Lazy-loaded components
const AddSource = lazy(() => import("@/pages/AddSource"));
const Transformations = lazy(() => import("@/pages/Transformations"));
const Transform = lazy(() => import("@/pages/Transform"));
const Destinations = lazy(() => import("@/pages/Destinations"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Settings = lazy(() => import("@/pages/Settings"));
const ProfileSettings = lazy(() => import("@/pages/settings/Profile"));
const ApiKeys = lazy(() => import("@/pages/settings/ApiKeys"));
const Webhooks = lazy(() => import("@/pages/settings/Webhooks"));
const Users = lazy(() => import("@/pages/settings/Users"));
const Help = lazy(() => import("@/pages/Help"));
const DevLogs = lazy(() => import("@/pages/dev/logs"));

// Auth pages
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const AuthCallback = lazy(() => import("@/pages/AuthCallback"));

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <Suspense fallback={<div className="p-8">Loading...</div>}>
          <Login />
        </Suspense>
      } />
      <Route path="/register" element={
        <Suspense fallback={<div className="p-8">Loading...</div>}>
          <Register />
        </Suspense>
      } />
      <Route path="/forgot-password" element={
        <Suspense fallback={<div className="p-8">Loading...</div>}>
          <ForgotPassword />
        </Suspense>
      } />
      <Route path="/reset-password" element={
        <Suspense fallback={<div className="p-8">Loading...</div>}>
          <ResetPassword />
        </Suspense>
      } />
      <Route path="/auth/callback" element={
        <Suspense fallback={<div className="p-8">Loading...</div>}>
          <AuthCallback />
        </Suspense>
      } />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/sources" element={<Sources />} />
        <Route path="/add-source" element={
          <Suspense fallback={<DashboardLoadingSkeleton />}>
            <AddSource />
          </Suspense>
        } />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/datasets" element={<MyDatasets />} />
        <Route path="/create-dataset" element={<CreateDatasetPage />} />
        <Route path="/transformations" element={
          <Suspense fallback={<DashboardLoadingSkeleton />}>
            <Transformations />
          </Suspense>
        } />
        <Route path="/transform/:id" element={
          <Suspense fallback={<DashboardLoadingSkeleton />}>
            <Transform />
          </Suspense>
        } />
        <Route path="/destinations" element={
          <Suspense fallback={<DashboardLoadingSkeleton />}>
            <Destinations />
          </Suspense>
        } />
        <Route path="/analytics" element={
          <Suspense fallback={<DashboardLoadingSkeleton />}>
            <Analytics />
          </Suspense>
        } />
        <Route path="/notifications" element={
          <Suspense fallback={<DashboardLoadingSkeleton />}>
            <Notifications />
          </Suspense>
        } />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={
          <Suspense fallback={<DashboardLoadingSkeleton />}>
            <Settings />
          </Suspense>
        } />
        <Route path="/settings/profile" element={
          <Suspense fallback={<DashboardLoadingSkeleton />}>
            <ProfileSettings />
          </Suspense>
        } />
        <Route path="/settings/api-keys" element={
          <Suspense fallback={<DashboardLoadingSkeleton />}>
            <ApiKeys />
          </Suspense>
        } />
        <Route path="/settings/webhooks" element={
          <Suspense fallback={<DashboardLoadingSkeleton />}>
            <Webhooks />
          </Suspense>
        } />
        <Route path="/settings/users" element={
          <Suspense fallback={<DashboardLoadingSkeleton />}>
            <Users />
          </Suspense>
        } />
        <Route path="/help" element={
          <Suspense fallback={<DashboardLoadingSkeleton />}>
            <Help />
          </Suspense>
        } />
        <Route path="/dev/logs" element={
          <Suspense fallback={<DashboardLoadingSkeleton />}>
            <DevLogs />
          </Suspense>
        } />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
