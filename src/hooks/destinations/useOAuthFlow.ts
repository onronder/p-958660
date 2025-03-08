
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useOAuthFlow() {
  const { toast } = useToast();

  // OAuth flow for Google Drive and OneDrive
  const initiateOAuth = async (provider: 'google_drive' | 'onedrive', redirectUri: string) => {
    try {
      const clientId = provider === 'google_drive' 
        ? import.meta.env.VITE_GOOGLE_CLIENT_ID 
        : import.meta.env.VITE_MICROSOFT_CLIENT_ID;
      
      if (!clientId) {
        throw new Error(`${provider} client ID not configured`);
      }
      
      // Configure OAuth URL based on provider
      let authUrl = '';
      if (provider === 'google_drive') {
        authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'https://www.googleapis.com/auth/drive.file',
          access_type: 'offline',
          prompt: 'consent'
        });
        authUrl = `${authUrl}?${params.toString()}`;
      } else { // onedrive
        authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'files.readwrite.all offline_access',
        });
        authUrl = `${authUrl}?${params.toString()}`;
      }
      
      // Open the OAuth window
      window.open(authUrl, '_blank', 'width=800,height=600');
      
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
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co';
      const response = await fetch(`${supabaseUrl}/functions/v1/oauth-callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ provider, code, redirectUri })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to complete ${provider} authentication`);
      }
      
      const data = await response.json();
      
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
