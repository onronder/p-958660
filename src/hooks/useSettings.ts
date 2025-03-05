
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
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

interface SecuritySettings {
  id: string;
  user_id: string;
  two_factor_enabled: boolean;
  last_password_change: string;
}

interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  api_key: string;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
}

interface Webhook {
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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings | null>(null);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingSecurity, setIsLoadingSecurity] = useState(false);
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(false);
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoadingProfile(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }
      
      const { data, error } = await supabase.functions.invoke("settings", {
        method: "GET",
        path: "profile",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      setProfile(data.profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchSecurity = async () => {
    if (!user) return;
    
    try {
      setIsLoadingSecurity(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }
      
      const { data, error } = await supabase.functions.invoke("settings", {
        method: "GET",
        path: "security",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      setSecuritySettings(data.security);
    } catch (error) {
      console.error("Error fetching security settings:", error);
      toast({
        title: "Error",
        description: "Failed to load security settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSecurity(false);
    }
  };

  const fetchApiKeys = async () => {
    if (!user) return;
    
    try {
      setIsLoadingApiKeys(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }
      
      const { data, error } = await supabase.functions.invoke("settings", {
        method: "GET",
        path: "api-keys",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      setApiKeys(data.apiKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      toast({
        title: "Error",
        description: "Failed to load API keys. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingApiKeys(false);
    }
  };

  const fetchWebhooks = async () => {
    if (!user) return;
    
    try {
      setIsLoadingWebhooks(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }
      
      const { data, error } = await supabase.functions.invoke("settings", {
        method: "GET",
        path: "webhooks",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      setWebhooks(data.webhooks);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      toast({
        title: "Error",
        description: "Failed to load webhooks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingWebhooks(false);
    }
  };

  const updateProfile = async (updatedProfile: Partial<Profile>) => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }
      
      const { data, error } = await supabase.functions.invoke("settings", {
        method: "POST",
        path: "update-profile",
        body: updatedProfile,
        headers: {
          Authorization: `Bearer ${session.access_token}`
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
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) return false;
    
    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return false;
      }
      
      const { data, error } = await supabase.functions.invoke("settings", {
        method: "POST",
        path: "change-password",
        body: { oldPassword, newPassword },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully.",
      });
      
      // Refresh security settings
      fetchSecurity();
      
      return true;
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const toggle2FA = async (enabled: boolean) => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }
      
      const { data, error } = await supabase.functions.invoke("settings", {
        method: "POST",
        path: "toggle-2fa",
        body: { enabled },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      setSecuritySettings(data.security);
      toast({
        title: `Two-Factor Authentication ${enabled ? 'Enabled' : 'Disabled'}`,
        description: data.message,
      });
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      toast({
        title: "Error",
        description: `Failed to ${enabled ? 'enable' : 'disable'} two-factor authentication. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const createApiKey = async (name: string, expiresAt?: string) => {
    if (!user) return null;
    
    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }
      
      const { data, error } = await supabase.functions.invoke("settings", {
        method: "POST",
        path: "create-api-key",
        body: { name, expiresAt },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      // Refresh API keys
      fetchApiKeys();
      
      toast({
        title: "API Key Created",
        description: "Your new API key has been created successfully.",
      });
      
      return data.apiKey;
    } catch (error) {
      console.error("Error creating API key:", error);
      toast({
        title: "Error",
        description: "Failed to create API key. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteApiKey = async (id: string) => {
    if (!user) return false;
    
    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return false;
      }
      
      const { error } = await supabase.functions.invoke("settings", {
        method: "POST",
        path: "delete-api-key",
        body: { id },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      // Update local state
      setApiKeys(apiKeys.filter(key => key.id !== id));
      
      toast({
        title: "API Key Deleted",
        description: "The API key has been deleted successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting API key:", error);
      toast({
        title: "Error",
        description: "Failed to delete API key. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const createWebhook = async (name: string, endpoint_url: string, event_type: string) => {
    if (!user) return null;
    
    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }
      
      const { data, error } = await supabase.functions.invoke("settings", {
        method: "POST",
        path: "create-webhook",
        body: { name, endpoint_url, event_type },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      // Refresh webhooks
      fetchWebhooks();
      
      toast({
        title: "Webhook Created",
        description: "Your new webhook has been created successfully.",
      });
      
      return data.webhook;
    } catch (error) {
      console.error("Error creating webhook:", error);
      toast({
        title: "Error",
        description: "Failed to create webhook. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const updateWebhook = async (id: string, updates: Partial<Webhook>) => {
    if (!user) return null;
    
    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }
      
      const { data, error } = await supabase.functions.invoke("settings", {
        method: "POST",
        path: "update-webhook",
        body: { id, ...updates },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      // Update local state
      setWebhooks(webhooks.map(webhook => webhook.id === id ? data.webhook : webhook));
      
      toast({
        title: "Webhook Updated",
        description: "The webhook has been updated successfully.",
      });
      
      return data.webhook;
    } catch (error) {
      console.error("Error updating webhook:", error);
      toast({
        title: "Error",
        description: "Failed to update webhook. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteWebhook = async (id: string) => {
    if (!user) return false;
    
    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return false;
      }
      
      const { error } = await supabase.functions.invoke("settings", {
        method: "POST",
        path: "delete-webhook",
        body: { id },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      // Update local state
      setWebhooks(webhooks.filter(webhook => webhook.id !== id));
      
      toast({
        title: "Webhook Deleted",
        description: "The webhook has been deleted successfully.",
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast({
        title: "Error",
        description: "Failed to delete webhook. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreferences = async (preferences: {
    timezone?: string;
    language?: string;
    dark_mode?: boolean;
    notifications_enabled?: boolean;
    auto_logout_minutes?: number;
  }) => {
    if (!user) return null;
    
    try {
      setIsSaving(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return null;
      }
      
      const { data, error } = await supabase.functions.invoke("settings", {
        method: "POST",
        path: "update-preferences",
        body: preferences,
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      setProfile(data.profile);
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been updated successfully.",
      });
      
      return data.profile;
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const completeOnboarding = async () => {
    if (!user) return false;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return false;
      }
      
      const { data, error } = await supabase.functions.invoke("settings", {
        method: "POST",
        path: "complete-onboarding",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      setProfile(data.profile);
      return true;
    } catch (error) {
      console.error("Error completing onboarding:", error);
      return false;
    }
  };

  return {
    profile,
    securitySettings,
    apiKeys,
    webhooks,
    isLoadingProfile,
    isLoadingSecurity,
    isLoadingApiKeys,
    isLoadingWebhooks,
    isSaving,
    fetchProfile,
    fetchSecurity,
    fetchApiKeys,
    fetchWebhooks,
    updateProfile,
    changePassword,
    toggle2FA,
    createApiKey,
    deleteApiKey,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    updatePreferences,
    completeOnboarding
  };
}
