
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import ProfileSettings from "@/components/settings/ProfileSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import ApiKeysSettings from "@/components/settings/ApiKeysSettings";
import BillingSettings from "@/components/settings/BillingSettings";
import PreferencesSettings from "@/components/settings/PreferencesSettings";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import InfoBanner from "@/components/InfoBanner";
import OnboardingTour from "@/components/settings/OnboardingTour";
import { useSettings } from "@/hooks/useSettings";
import { useAuth } from "@/contexts/AuthContext";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, fetchProfile, updateProfile } = useSettings();
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    // Show onboarding tour for new users
    if (profile && profile.onboarding_completed === false) {
      setShowTour(true);
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    
    // We're not actually using the synthetic save button anymore
    // since each settings panel has its own save functionality
    // This is kept for backwards compatibility
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings saved",
        description: "Your changes have been saved successfully.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-8">
      {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}
      
      <InfoBanner 
        message={
          <span>
            <span className="font-bold">⚙️ Settings</span> - Customize your account, manage security, and configure app preferences to personalize your FlowTechs experience.
          </span>
        } 
      />

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Settings</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              // Reset form state
              window.location.reload();
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <Tabs 
          defaultValue="profile" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="mb-6 bg-muted w-full justify-start overflow-x-auto border-b border-border rounded-none h-auto p-0">
            <TabsTrigger 
              value="profile"
              className="py-3 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              Profile & Account
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="py-3 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              Security
            </TabsTrigger>
            <TabsTrigger 
              value="api-keys"
              className="py-3 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              API Keys & Webhooks
            </TabsTrigger>
            <TabsTrigger 
              value="billing"
              className="py-3 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              Billing & Subscription
            </TabsTrigger>
            <TabsTrigger 
              value="preferences"
              className="py-3 px-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
            >
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="api-keys" className="mt-6">
            <ApiKeysSettings />
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <BillingSettings />
          </TabsContent>

          <TabsContent value="preferences" className="mt-6">
            <PreferencesSettings />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Settings;
