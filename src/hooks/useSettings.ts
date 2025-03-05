
import { useProfileSettings } from "./settings/useProfileSettings";
import { useSecuritySettings } from "./settings/useSecuritySettings";
import { useApiKeys } from "./settings/useApiKeys";
import { useWebhooks } from "./settings/useWebhooks";
import { useState } from "react";

// Use 'export type' to explicitly mark type re-exports
export type { Profile, SecuritySettings, ApiKey, Webhook } from "./settings/useSettingsBase";

export function useSettings() {
  const [isLoading, setIsLoading] = useState(false);
  
  const profileSettings = useProfileSettings();
  const securitySettings = useSecuritySettings();
  const apiKeysSettings = useApiKeys();
  const webhooksSettings = useWebhooks();

  // Combine loading states
  const loading = 
    profileSettings.isLoading || 
    securitySettings.isLoading || 
    apiKeysSettings.isLoading || 
    webhooksSettings.isLoading;

  return {
    // Combined loading state for all operations
    isLoading: loading,
    
    // Profile-related state and methods
    profile: profileSettings.profile,
    fetchProfile: profileSettings.fetchProfile,
    updateProfile: profileSettings.updateProfile,
    completeOnboarding: profileSettings.completeOnboarding,
    updatePreferences: profileSettings.updatePreferences,
    
    // Security-related state and methods
    securitySettings: securitySettings.securitySettings,
    fetchSecuritySettings: securitySettings.fetchSecuritySettings,
    updateSecuritySettings: securitySettings.updateSecuritySettings,
    changePassword: securitySettings.changePassword,
    toggleTwoFactor: securitySettings.toggleTwoFactor,
    
    // API key-related state and methods
    apiKeys: apiKeysSettings.apiKeys,
    fetchApiKeys: apiKeysSettings.fetchApiKeys,
    createApiKey: apiKeysSettings.createApiKey,
    deleteApiKey: apiKeysSettings.deleteApiKey,
    
    // Webhook-related state and methods
    webhooks: webhooksSettings.webhooks,
    fetchWebhooks: webhooksSettings.fetchWebhooks,
    createWebhook: webhooksSettings.createWebhook,
    updateWebhook: webhooksSettings.updateWebhook,
    deleteWebhook: webhooksSettings.deleteWebhook
  };
}
