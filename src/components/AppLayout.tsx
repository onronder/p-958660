
import React, { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import FlowTechsSidebar from "@/components/FlowTechsSidebar";
import NotificationSidebar from "@/components/NotificationSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSettings } from "@/hooks/useSettings";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AppLayout = () => {
  const { signOut } = useAuth();
  const { setTheme } = useTheme();
  const { profile, fetchProfile, isLoading } = useSettings();
  const [error, setError] = useState<string | null>(null);
  const [initialLoadAttempted, setInitialLoadAttempted] = useState(false);
  const isMounted = useRef(true);
  
  // Fetch user profile on component mount - only once
  useEffect(() => {
    // Set up mounted ref for cleanup
    isMounted.current = true;
    
    const loadUserProfile = async () => {
      if (initialLoadAttempted) return;
      
      try {
        console.log("AppLayout: Initial profile load attempt");
        setError(null);
        setInitialLoadAttempted(true);
        await fetchProfile();
      } catch (err) {
        console.error("Error loading user profile:", err);
        if (isMounted.current) {
          setError("Failed to load user profile. Some features may not work correctly.");
        }
      }
    };
    
    loadUserProfile();
    
    // Cleanup
    return () => {
      isMounted.current = false;
    };
  }, [fetchProfile, initialLoadAttempted]);
  
  // Sync theme with profile settings once profile is loaded
  useEffect(() => {
    if (profile && isMounted.current) {
      console.log("AppLayout: Setting theme based on profile", profile.dark_mode);
      setTheme(profile.dark_mode ? "dark" : "light");
    }
  }, [profile, setTheme]);
  
  const handleLogout = async () => {
    console.log("Logout button clicked, calling signOut()");
    await signOut();
  };

  const handleTryAgain = async () => {
    setError(null);
    try {
      await fetchProfile();
    } catch (err) {
      console.error("Error retrying profile load:", err);
      if (isMounted.current) {
        setError("Failed to load user profile. Some features may not work correctly.");
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <FlowTechsSidebar onLogout={handleLogout} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-6">
            <NotificationSidebar />
          </div>
          
          {isLoading && !profile && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading profile...</span>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-5 w-5 mr-2" />
              <div className="flex-1">
                <AlertTitle>Profile Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </div>
              <Button variant="destructive" size="sm" onClick={handleTryAgain}>
                Try Again
              </Button>
            </Alert>
          )}
          
          <Outlet />
        </div>
      </main>
    </div>
  );
};

// This is needed to make the Button component available
import { Button } from "@/components/ui/button";

export default AppLayout;
