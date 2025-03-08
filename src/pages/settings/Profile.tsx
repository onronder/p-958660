
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon, UserIcon, AlertCircle, Loader2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Profile = () => {
  const { theme, setTheme } = useTheme();
  const { profile, updatePreferences, isLoading } = useSettings();
  const [error, setError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  
  // Synchronize theme with profile on initial load
  useEffect(() => {
    if (profile && !isLoading) {
      // Only set theme if it's different from current
      if ((profile.dark_mode && theme !== "dark") || (!profile.dark_mode && theme !== "light")) {
        setTheme(profile.dark_mode ? "dark" : "light");
      }
    }
  }, [profile, theme, setTheme, isLoading]);
  
  const toggleTheme = async () => {
    if (isLoading || localLoading) return;
    
    const newTheme = theme === "dark" ? "light" : "dark";
    
    try {
      setLocalLoading(true);
      setError(null);
      
      // Update UI immediately for better UX
      setTheme(newTheme);
      
      // Then update the database
      if (profile) {
        await updatePreferences({ 
          dark_mode: newTheme === "dark" 
        });
      }
    } catch (err) {
      console.error("Error updating theme preference:", err);
      setError("Failed to save theme preference. Please try again later.");
      
      // Revert theme if update failed
      setTheme(theme);
    } finally {
      setLocalLoading(false);
    }
  };

  const useSystemTheme = async () => {
    if (isLoading || localLoading) return;
    
    try {
      setLocalLoading(true);
      setError(null);
      
      // Determine system theme
      const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Set UI theme
      setTheme("system");
      
      // Update database with current system preference
      if (profile) {
        await updatePreferences({ dark_mode: systemDarkMode });
      }
    } catch (err) {
      console.error("Error updating theme preference:", err);
      setError("Failed to save theme preference. Please try again later.");
    } finally {
      setLocalLoading(false);
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
        <div className="flex justify-center items-center p-8 bg-card rounded-lg shadow">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading profile information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="bg-card rounded-lg shadow p-6">
        <p className="text-muted-foreground mb-6">
          Manage your profile information and account settings.
        </p>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.profile_picture_url || ""} />
              <AvatarFallback>
                <UserIcon className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{profile?.first_name || "User"} {profile?.last_name || ""}</p>
              <p className="text-sm text-muted-foreground">{profile?.company || "No company set"}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Theme Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <div className="text-sm text-muted-foreground">
                  Toggle between light and dark theme.
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <SunIcon className={`h-5 w-5 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  disabled={isLoading || localLoading}
                  onCheckedChange={() => toggleTheme()}
                />
                <MoonIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={useSystemTheme}
              disabled={isLoading || localLoading}
            >
              {localLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Use System Theme"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
