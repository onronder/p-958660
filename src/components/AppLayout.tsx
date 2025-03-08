
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import FlowTechsSidebar from "@/components/FlowTechsSidebar";
import NotificationSidebar from "@/components/NotificationSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSettings } from "@/hooks/useSettings";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const AppLayout = () => {
  const { signOut } = useAuth();
  const { setTheme } = useTheme();
  const { profile, fetchProfile, isLoading } = useSettings();
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setError(null);
        await fetchProfile();
      } catch (err) {
        console.error("Error loading user profile:", err);
        setError("Failed to load user profile. Some features may not work correctly.");
      }
    };
    
    loadUserProfile();
  }, [fetchProfile]);
  
  // Sync theme with profile settings
  useEffect(() => {
    if (profile) {
      // If profile has dark_mode setting, apply it to theme provider
      setTheme(profile.dark_mode ? "dark" : "light");
    }
  }, [profile, setTheme]);
  
  const handleLogout = async () => {
    console.log("Logout button clicked, calling signOut()");
    await signOut();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <FlowTechsSidebar onLogout={handleLogout} />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-end mb-6">
            <NotificationSidebar />
          </div>
          
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading profile...</span>
            </div>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Profile Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
