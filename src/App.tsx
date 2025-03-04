
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FlowTechsSidebar from "@/components/FlowTechsSidebar";
import Dashboard from "./pages/Dashboard";
import Sources from "./pages/Sources";
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
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { user, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <div className="flex min-h-screen bg-background">
          <FlowTechsSidebar />
          <main className="flex-1 ml-64 p-8">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sources" element={<Sources />} />
                <Route path="/transform" element={<Transform />} />
                <Route path="/destinations" element={<Destinations />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/storage" element={<Storage />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </main>
        </div>
      ) : (
        <Routes>
          <Route path="/login" element={<Login onLogin={() => {}} />} />
          <Route path="/register" element={<Register onRegister={() => {}} />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </>
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
