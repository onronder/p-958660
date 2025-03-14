
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useOAuthFlow() {
  const { toast } = useToast();

  // OAuth flow for Google Drive and OneDrive
  const initiateOAuth = async (provider: 'google_drive' | 'onedrive', redirectUri: string) => {
    try {
      console.log(`Starting OAuth flow for ${provider} with redirectUri:`, redirectUri);
      
      // Fetch client ID from Supabase Edge Function to get the actual value
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Authentication required");
      }
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co';
      console.log("Using Supabase URL:", supabaseUrl);
      
      const response = await fetch(`${supabaseUrl}/functions/v1/get-oauth-config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ provider })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Failed to get ${provider} configuration:`, errorData);
        throw new Error(errorData.error || `Failed to get ${provider} configuration`);
      }
      
      const { clientId } = await response.json();
      console.log(`Received clientId for ${provider}:`, clientId ? "present" : "missing");
      
      if (!clientId) {
        throw new Error(`${provider} client ID not configured`);
      }
      
      // Always use the exact origin/callback combination for OAuth
      // This ensures that the redirect URI is consistent and matches what's registered in the OAuth provider
      const callbackUrl = `${window.location.origin}/auth/callback`;
      
      console.log("Using redirect URI:", callbackUrl);
      
      // Get the current deployment URL for the state parameter
      const deploymentUrl = window.location.origin;
      console.log("Current deployment URL:", deploymentUrl);
      
      // Configure OAuth URL based on provider
      let authUrl = '';
      if (provider === 'google_drive') {
        authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: callbackUrl,
          response_type: 'code',
          scope: 'https://www.googleapis.com/auth/drive.file',
          access_type: 'offline', // Ensure this is set to 'offline' to get refresh token
          prompt: 'consent', // Force consent screen to ensure refresh token
          state: JSON.stringify({ provider, origin: deploymentUrl }) // Add origin to state for validation
        });
        authUrl = `${authUrl}?${params.toString()}`;
      } else { // onedrive
        authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: callbackUrl,
          response_type: 'code',
          scope: 'files.readwrite.all offline_access', // 'offline_access' is Microsoft's equivalent to 'access_type=offline'
          state: JSON.stringify({ provider, origin: deploymentUrl }) // Add origin to state for validation
        });
        authUrl = `${authUrl}?${params.toString()}`;
      }
      
      // Log the full URL being used
      console.log(`Full ${provider} OAuth URL:`, authUrl);
      
      // Open the OAuth window
      const oauthWindow = window.open(authUrl, '_blank', 'width=800,height=600');
      
      if (!oauthWindow) {
        throw new Error("Popup blocked! Please allow popups for this site.");
      }
      
      // Return the auth URL in case it's needed
      return { url: authUrl };
    } catch (error) {
      console.error(`Error initiating ${provider} OAuth:`, error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : `Failed to start ${provider} authentication`,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Handle OAuth callback (called when the OAuth flow is complete)
  const handleOAuthCallback = async (provider: 'google_drive' | 'onedrive', code: string, redirectUri: string) => {
    try {
      console.log(`Handling OAuth callback for ${provider} with code: present, redirectUri:`, redirectUri);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Authentication required");
      }
      
      // Always use the exact origin/callback combination for OAuth
      // This ensures consistency with the authorization request
      const callbackUrl = `${window.location.origin}/auth/callback`;
      
      console.log("Using callback URL for token exchange:", callbackUrl);
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co';
      console.log("Using Supabase URL for token exchange:", supabaseUrl);
      
      console.log("Sending data to oauth-callback function:", {
        provider,
        redirectUri: callbackUrl
      });
      
      const response = await fetch(`${supabaseUrl}/functions/v1/oauth-callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ provider, code, redirectUri: callbackUrl })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }
        
        console.error(`Failed to complete ${provider} authentication:`, errorData);
        throw new Error(errorData.error || `Failed to complete ${provider} authentication`);
      }
      
      const data = await response.json();
      console.log(`Successfully completed ${provider} authentication:`, data);
      
      toast({
        title: "Authentication Successful",
        description: `Successfully connected to ${provider === 'google_drive' ? 'Google Drive' : 'Microsoft OneDrive'}`,
      });
      
      return data;
    } catch (error) {
      console.error(`Error handling ${provider} OAuth callback:`, error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : `Failed to complete ${provider} authentication`,
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    initiateOAuth,
    handleOAuthCallback
  };
}
