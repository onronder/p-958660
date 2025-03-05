
import { useState } from "react";
import { useSettingsBase, SecuritySettings } from "./useSettingsBase";
import { supabase } from "@/integrations/supabase/client";

export function useSecuritySettings() {
  const { user, toast, isLoading, setIsLoading, invokeSettingsFunction } = useSettingsBase();
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);

  // Fetch security settings
  const fetchSecuritySettings = async () => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { security } = await invokeSettingsFunction("get_security");
      setSecuritySettings(security);
      return security;
    } catch (error) {
      console.error("Error fetching security settings:", error);
      toast({
        title: "Error",
        description: "Failed to load security settings",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update security settings
  const updateSecuritySettings = async (securityData: Partial<SecuritySettings>) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { security } = await invokeSettingsFunction("update_security", securityData);
      setSecuritySettings(security);
      
      toast({
        title: "Security Settings Updated",
        description: "Your security settings have been updated successfully.",
      });
      
      return security;
    } catch (error) {
      console.error("Error updating security settings:", error);
      toast({
        title: "Error",
        description: "Failed to update security settings",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      // Update the last password change timestamp
      await invokeSettingsFunction("update_security", {
        last_password_change: new Date().toISOString()
      });
      
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle two-factor authentication
  const toggleTwoFactor = async (enabled: boolean) => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const { security } = await invokeSettingsFunction("update_security", {
        two_factor_enabled: enabled
      });
      
      setSecuritySettings(security);
      
      toast({
        title: `Two-Factor Authentication ${enabled ? 'Enabled' : 'Disabled'}`,
        description: `Two-factor authentication has been ${enabled ? 'enabled' : 'disabled'} successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error toggling two-factor authentication:", error);
      toast({
        title: "Error",
        description: "Failed to update two-factor authentication",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    securitySettings,
    isLoading,
    fetchSecuritySettings,
    updateSecuritySettings,
    changePassword,
    toggleTwoFactor
  };
}
