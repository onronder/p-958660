
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  timezone: string;
  language: string;
  dark_mode: boolean;
  notifications_enabled: boolean;
  auto_logout_minutes: number;
  onboarding_completed: boolean;
}

export interface SecuritySettings {
  id: string;
  user_id: string;
  two_factor_enabled: boolean;
  last_password_change: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  api_key: string;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
}

export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  endpoint_url: string;
  event_type: string;
  secret_key: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  last_triggered_at: string | null;
}

export function useSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);

  // Fetch user profile
  const fetchProfile = async () => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("settings", {
        body: {
          action: "get_profile",
          userId: user.id,
        }
      });
      
      if (error) throw error;
      setProfile(data.profile);
      return data.profile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile information",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (profileData: Partial<Profile>) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("settings", {
        body: {
          action: "update_profile",
          userId: user.id,
          data: profileData
        }
      });
      
      if (error) throw error;
      setProfile(data.profile);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      
      return data.profile;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile information",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch security settings
  const fetchSecuritySettings = async () => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("settings", {
        body: {
          action: "get_security",
          userId: user.id,
        }
      });
      
      if (error) throw error;
      setSecuritySettings(data.security);
      return data.security;
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
      const { data, error } = await supabase.functions.invoke("settings", {
        body: {
          action: "update_security",
          userId: user.id,
          data: securityData
        }
      });
      
      if (error) throw error;
      setSecuritySettings(data.security);
      
      toast({
        title: "Security Settings Updated",
        description: "Your security settings have been updated successfully.",
      });
      
      return data.security;
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
      await supabase.functions.invoke("settings", {
        body: {
          action: "update_security",
          userId: user.id,
          data: {
            last_password_change: new Date().toISOString()
          }
        }
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
      const { data, error } = await supabase.functions.invoke("settings", {
        body: {
          action: "update_security",
          userId: user.id,
          data: {
            two_factor_enabled: enabled
          }
        }
      });
      
      if (error) throw error;
      setSecuritySettings(data.security);
      
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

  // Fetch API keys
  const fetchApiKeys = async () => {
    if (!user) return [];
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("settings", {
        body: {
          action: "get_api_keys",
          userId: user.id,
        }
      });
      
      if (error) throw error;
      setApiKeys(data.apiKeys);
      return data.apiKeys;
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Create API key
  const createApiKey = async (name: string, expiresAt?: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("settings", {
        body: {
          action: "create_api_key",
          userId: user.id,
          data: {
            name,
            expires_at: expiresAt
          }
        }
      });
      
      if (error) throw error;
      
      // Add the new key to the state
      setApiKeys(prev => [data.apiKey, ...prev]);
      
      toast({
        title: "API Key Created",
        description: "Your new API key has been created successfully.",
      });
      
      return { ...data.apiKey, key: data.key };
    } catch (error) {
      console.error("Error creating API key:", error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete API key
  const deleteApiKey = async (keyId: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("settings", {
        body: {
          action: "delete_api_key",
          userId: user.id,
          data: {
            keyId
          }
        }
      });
      
      if (error) throw error;
      
      // Remove the key from state
      setApiKeys(prev => prev.filter(key => key.id !== keyId));
      
      toast({
        title: "API Key Deleted",
        description: "The API key has been deleted successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch webhooks
  const fetchWebhooks = async () => {
    if (!user) return [];
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("settings", {
        body: {
          action: "get_webhooks",
          userId: user.id,
        }
      });
      
      if (error) throw error;
      setWebhooks(data.webhooks);
      return data.webhooks;
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      toast({
        title: "Error",
        description: "Failed to load webhooks",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Create webhook
  const createWebhook = async (name: string, endpointUrl: string, eventType: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("settings", {
        body: {
          action: "create_webhook",
          userId: user.id,
          data: {
            name,
            endpoint_url: endpointUrl,
            event_type: eventType
          }
        }
      });
      
      if (error) throw error;
      
      // Add the new webhook to the state
      setWebhooks(prev => [data.webhook, ...prev]);
      
      toast({
        title: "Webhook Created",
        description: "Your new webhook has been created successfully.",
      });
      
      return data.webhook;
    } catch (error) {
      console.error("Error creating webhook:", error);
      toast({
        title: "Error",
        description: "Failed to create webhook",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Update webhook
  const updateWebhook = async (
    webhookId: string,
    name: string,
    endpointUrl: string,
    eventType: string,
    active: boolean
  ) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("settings", {
        body: {
          action: "update_webhook",
          userId: user.id,
          data: {
            webhookId,
            name,
            endpoint_url: endpointUrl,
            event_type: eventType,
            active
          }
        }
      });
      
      if (error) throw error;
      
      // Update the webhook in the state
      setWebhooks(prev => 
        prev.map(webhook => webhook.id === webhookId ? data.webhook : webhook)
      );
      
      toast({
        title: "Webhook Updated",
        description: "The webhook has been updated successfully.",
      });
      
      return data.webhook;
    } catch (error) {
      console.error("Error updating webhook:", error);
      toast({
        title: "Error",
        description: "Failed to update webhook",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete webhook
  const deleteWebhook = async (webhookId: string) => {
    if (!user) return false;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("settings", {
        body: {
          action: "delete_webhook",
          userId: user.id,
          data: {
            webhookId
          }
        }
      });
      
      if (error) throw error;
      
      // Remove the webhook from state
      setWebhooks(prev => prev.filter(webhook => webhook.id !== webhookId));
      
      toast({
        title: "Webhook Deleted",
        description: "The webhook has been deleted successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Complete onboarding
  const completeOnboarding = async () => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase.functions.invoke("settings", {
        body: {
          action: "complete_onboarding",
          userId: user.id
        }
      });
      
      if (error) throw error;
      
      // Update the profile in the state
      if (profile) {
        setProfile({
          ...profile,
          onboarding_completed: true
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error completing onboarding:", error);
      return false;
    }
  };

  // Update user preferences
  const updatePreferences = async (preferences: {
    dark_mode?: boolean;
    notifications_enabled?: boolean;
    timezone?: string;
    language?: string;
    auto_logout_minutes?: number;
  }) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("settings", {
        body: {
          action: "update_preferences",
          userId: user.id,
          data: preferences
        }
      });
      
      if (error) throw error;
      
      // Update the profile in state
      if (profile) {
        setProfile({
          ...profile,
          ...preferences
        });
      }
      
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been updated successfully.",
      });
      
      return data.preferences;
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    profile,
    securitySettings,
    apiKeys,
    webhooks,
    fetchProfile,
    updateProfile,
    fetchSecuritySettings,
    updateSecuritySettings,
    changePassword,
    toggleTwoFactor,
    fetchApiKeys,
    createApiKey,
    deleteApiKey,
    fetchWebhooks,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    completeOnboarding,
    updatePreferences
  };
}
