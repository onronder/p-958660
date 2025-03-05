
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import FlowTechsSidebar from "@/components/FlowTechsSidebar";
import Dashboard from "./pages/Dashboard";
import Sources from "./pages/Sources";
import AddSource from "./pages/AddSource";
import Transform from "./pages/Transform";
import Destinations from "./pages/Destinations";
import Jobs from "./pages/Jobs";
import Analytics from "./pages/Analytics";
import Storage from "./pages/Storage";
import Insights from "./pages/Insights";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import NotificationSidebar from "@/components/NotificationSidebar";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-background">
      <FlowTechsSidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-6">
            <NotificationSidebar />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  console.log("AppRoutes rendering, user:", user ? "logged in" : "not logged in", "isLoading:", isLoading);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes - accessible when not logged in */}
      <Route path="/login" element={
        user ? <Navigate to="/" replace /> : <Login onLogin={() => {}} />
      } />
      
      <Route path="/register" element={
        user ? <Navigate to="/" replace /> : <Register onRegister={() => {}} />
      } />
      
      <Route path="/forgot-password" element={
        user ? <Navigate to="/" replace /> : <ForgotPassword />
      } />
      
      <Route path="/reset-password" element={
        user ? <Navigate to="/" replace /> : <ResetPassword />
      } />

      {/* Protected Routes - require authentication */}
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/sources" element={
        <ProtectedRoute>
          <AppLayout>
            <Sources />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/sources/add" element={
        <ProtectedRoute>
          <AppLayout>
            <AddSource />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/transform" element={
        <ProtectedRoute>
          <AppLayout>
            <Transform />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/destinations" element={
        <ProtectedRoute>
          <AppLayout>
            <Destinations />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/jobs" element={
        <ProtectedRoute>
          <AppLayout>
            <Jobs />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/analytics" element={
        <ProtectedRoute>
          <AppLayout>
            <Analytics />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/storage" element={
        <ProtectedRoute>
          <AppLayout>
            <Storage />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/insights" element={
        <ProtectedRoute>
          <AppLayout>
            <Insights />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/notifications" element={
        <ProtectedRoute>
          <AppLayout>
            <Notifications />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout>
            <Settings />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/help" element={
        <ProtectedRoute>
          <AppLayout>
            <Help />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Catch-all route - redirects to login or home based on auth state */}
      <Route path="*" element={
        user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />
      } />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
