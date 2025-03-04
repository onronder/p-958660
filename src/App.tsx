
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
import { useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // If we wanted to make this a real app, we'd check localStorage or cookies
  // for a valid token here or use a proper auth context

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {isAuthenticated ? (
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
                    <Route path="/logout" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </main>
            </div>
          ) : (
            <Routes>
              <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
              <Route path="/register" element={<Register onRegister={() => setIsAuthenticated(true)} />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          )}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
