import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { useState, useEffect } from "react";
import "./App.css";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import Destinations from "./pages/Destinations";
import Analytics from "./pages/Analytics";

// Components
import Layout from "./components/Layout";
import PublicRoute from "./components/PublicRoute";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  const [queryClient] = useState(() => new QueryClient());

  // Apply theme on app load
  useEffect(() => {
    // Check for saved theme preference or use OS preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || 
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />
              <Route path="pricing" element={<Pricing />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:id" element={<BlogPost />} />

              <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="signup" element={<PublicRoute><SignUp /></PublicRoute>} />
              <Route path="forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
              <Route path="reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

              <Route path="dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="destinations" element={<PrivateRoute><Destinations /></PrivateRoute>} />
              <Route path="analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
              <Route path="settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

              <Route path="unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
