
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon, UserIcon, AlertCircle } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Profile = () => {
  const { theme, setTheme } = useTheme();
  const { profile, updatePreferences, isLoading } = useSettings();
  const [error, setError] = useState<string | null>(null);
  
  const toggleTheme = () => {
    if (isLoading) return;
    
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    // Also update the user preferences in the database
    if (profile) {
      setError(null);
      updatePreferences({ 
        dark_mode: newTheme === "dark" 
      }).catch(err => {
        console.error("Error updating theme preference:", err);
        setError("Failed to save theme preference. Please try again later.");
      });
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-4">User Profile</h1>
        <div className="bg-card rounded-lg shadow p-6">
          <p className="text-muted-foreground mb-6">Loading profile information...</p>
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
                  disabled={isLoading}
                  onCheckedChange={toggleTheme}
                />
                <MoonIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setTheme("system");
                if (profile) {
                  updatePreferences({ 
                    dark_mode: window.matchMedia('(prefers-color-scheme: dark)').matches 
                  }).catch(err => {
                    console.error("Error updating theme preference:", err);
                  });
                }
              }}
              disabled={isLoading}
            >
              Use System Theme
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
