
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme/ThemeProvider";
import { Button } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "lucide-react";

const Profile = () => {
  const { theme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="bg-card rounded-lg shadow p-6">
        <p className="text-muted-foreground mb-6">
          Manage your profile information and account settings.
        </p>
        
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
                  onCheckedChange={toggleTheme}
                />
                <MoonIcon className={`h-5 w-5 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
            </div>
            
            <Button variant="outline" onClick={() => setTheme("system")}>
              Use System Theme
            </Button>
          </CardContent>
        </Card>
        
        <div className="border border-dashed border-border rounded-lg p-8 text-center mt-6">
          <p className="text-muted-foreground">Complete profile management will be implemented in a future update.</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
