
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/hooks/useSettings";
import { useDismissibleHelp } from "@/hooks/useDismissibleHelp";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useTheme } from "@/components/theme/ThemeProvider";

const PreferencesSettings = () => {
  const { profile, updatePreferences, isLoading } = useSettings();
  const { resetAllDismissedMessages, isResetting } = useDismissibleHelp();
  const { theme, setTheme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  
  const handleDarkModeChange = async (checked: boolean) => {
    try {
      setError(null);
      
      // Update theme provider immediately for better UX
      setTheme(checked ? "dark" : "light");
      
      // Then save to backend
      await updatePreferences({ dark_mode: checked });
    } catch (err) {
      console.error("Failed to update dark mode setting:", err);
      setError("Failed to save theme preference. Please try again.");
      
      // Revert theme if backend update fails
      setTheme(profile?.dark_mode ? "dark" : "light");
    }
  };
  
  const handleNotificationsChange = async (checked: boolean) => {
    try {
      setError(null);
      await updatePreferences({ notifications_enabled: checked });
    } catch (err) {
      console.error("Failed to update notifications setting:", err);
      setError("Failed to save notification preference. Please try again.");
    }
  };
  
  const handleAutoLogoutChange = async (value: string) => {
    try {
      setError(null);
      await updatePreferences({ auto_logout_minutes: parseInt(value) });
    } catch (err) {
      console.error("Failed to update auto logout setting:", err);
      setError("Failed to save auto logout preference. Please try again.");
    }
  };

  const handleResetHelpMessages = async () => {
    try {
      setError(null);
      await resetAllDismissedMessages();
      
      // You might want to refresh the page or affected components here
      // so the banners show up immediately
      window.location.reload();
    } catch (err) {
      console.error("Failed to reset help messages:", err);
      setError("Failed to reset help messages. Please try again.");
    }
  };
  
  if (!profile && isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
        <span>Loading preferences...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Interface Preferences</CardTitle>
          <CardDescription>
            Customize the appearance and behavior of the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="dark-mode">Dark Mode</Label>
              <div className="text-sm text-muted-foreground">
                Enable dark mode for reduced eye strain in low-light environments.
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === "dark"}
              onCheckedChange={handleDarkModeChange}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="enable-notifications">Enable Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Receive important notifications about system updates and job status changes.
              </div>
            </div>
            <Switch
              id="enable-notifications"
              checked={profile?.notifications_enabled || false}
              onCheckedChange={handleNotificationsChange}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="auto-logout">Auto Logout (minutes)</Label>
            <Select
              value={profile?.auto_logout_minutes?.toString() || "30"}
              onValueChange={handleAutoLogoutChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a timeout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="240">4 hours</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              The system will automatically log you out after this period of inactivity.
            </p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Help & Guidance</CardTitle>
          <CardDescription>
            Manage how help content is displayed throughout the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Help Messages</Label>
              <div className="text-sm text-muted-foreground">
                Reset all previously dismissed help messages in the application.
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleResetHelpMessages}
              disabled={isResetting}
            >
              {isResetting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Restore Help Messages
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferencesSettings;
