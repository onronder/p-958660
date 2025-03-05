
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Lightbulb, Bell, Clock, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import OnboardingTour from "@/components/settings/OnboardingTour";

const PreferencesSettings = () => {
  const { toast } = useToast();
  
  // Theme preferences
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Notification preferences
  const [notifyJobCompletion, setNotifyJobCompletion] = useState(true);
  const [notifyFailedJobs, setNotifyFailedJobs] = useState(true);
  const [notifyDataUpdates, setNotifyDataUpdates] = useState(false);
  
  // Session preferences
  const [autoLogoutTime, setAutoLogoutTime] = useState("60");
  
  // Onboarding tour state
  const [showTour, setShowTour] = useState(false);
  
  // Check system theme preference on component mount
  useEffect(() => {
    const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDarkMode);
  }, []);
  
  // Handle theme change
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    
    // Apply theme change
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    toast({
      title: !isDarkMode ? "Dark mode enabled" : "Light mode enabled",
      description: "Your theme preference has been updated.",
    });
  };
  
  // Start onboarding tour
  const startTour = () => {
    setShowTour(true);
  };
  
  // Reset all preferences to default
  const resetPreferences = () => {
    setIsDarkMode(false);
    document.documentElement.classList.remove("dark");
    
    setNotifyJobCompletion(true);
    setNotifyFailedJobs(true);
    setNotifyDataUpdates(false);
    
    setAutoLogoutTime("60");
    
    toast({
      title: "Preferences reset",
      description: "All preferences have been reset to default values.",
    });
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how FlowTechs looks for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <p className="font-medium">Dark Mode</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark theme
              </p>
            </div>
            <Switch 
              checked={isDarkMode} 
              onCheckedChange={toggleDarkMode}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Control when and how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Job Completion Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when your scheduled jobs complete successfully
                </p>
              </div>
              <Switch 
                checked={notifyJobCompletion} 
                onCheckedChange={setNotifyJobCompletion}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Failed Job Alerts</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when jobs fail to complete
                </p>
              </div>
              <Switch 
                checked={notifyFailedJobs} 
                onCheckedChange={setNotifyFailedJobs}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Data Update Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when your source data is updated
                </p>
              </div>
              <Switch 
                checked={notifyDataUpdates} 
                onCheckedChange={setNotifyDataUpdates}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Session Preferences</CardTitle>
          <CardDescription>
            Manage your session settings for better security
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <p className="font-medium">Auto Logout Time</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically log you out after a period of inactivity
              </p>
            </div>
            <div className="w-32">
              <Select 
                value={autoLogoutTime} 
                onValueChange={setAutoLogoutTime}
              >
                <SelectTrigger id="autoLogoutTime">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="240">4 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Onboarding</CardTitle>
          <CardDescription>
            Control your onboarding experience
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="font-medium">Product Tour</p>
              <p className="text-sm text-muted-foreground">
                Start the guided tour to learn about key features
              </p>
            </div>
            <Button variant="outline" onClick={startTour}>
              Start Tour
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button variant="outline" onClick={resetPreferences}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>
      
      {showTour && (
        <OnboardingTour onClose={() => setShowTour(false)} />
      )}
    </div>
  );
};

export default PreferencesSettings;
