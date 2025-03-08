
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import FlowTechsSidebar from "@/components/FlowTechsSidebar";
import NotificationSidebar from "@/components/NotificationSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useSettings } from "@/hooks/useSettings";

const AppLayout = () => {
  const { signOut } = useAuth();
  const { setTheme } = useTheme();
  const { profile, fetchProfile } = useSettings();
  
  // Fetch user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      await fetchProfile();
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
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
