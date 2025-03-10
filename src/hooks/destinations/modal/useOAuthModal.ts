
import { useState } from "react";
import { useDestinations } from "@/hooks/useDestinations";
import { useToast } from "@/hooks/use-toast";
import { OAuthError } from "./types";

export const useOAuthModal = () => {
  const [oauthComplete, setOauthComplete] = useState<boolean>(false);
  const [oauthError, setOauthError] = useState<OAuthError | null>(null);
  const { initiateOAuth, handleOAuthCallback } = useDestinations();
  const { toast } = useToast();

  const handleOAuthLogin = async (provider: 'google_drive' | 'onedrive') => {
    try {
      setOauthError(null);
      
      // Use the consistent redirect URI
      const redirectUri = `${window.location.origin}/auth/callback`;
      
      // Log authentication attempt
      console.log(`Attempting OAuth login for ${provider}`, {
        redirectUri,
        origin: window.location.origin,
        windowLocation: window.location.href
      });
      
      await initiateOAuth(provider, redirectUri);
      
      toast({
        title: "Authorization Required",
        description: `Please authorize with ${provider === 'google_drive' ? 'Google' : 'Microsoft'} in the new window.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error initiating OAuth flow:", error);
      
      setOauthError({
        error: "oauth_initiation_failed",
        description: error instanceof Error ? error.message : "Failed to start authentication",
        detailedMessage: "Check browser console for more details"
      });
      
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to start authentication",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const processOAuthCallback = async (provider: string, code: string) => {
    try {
      console.log(`Processing OAuth callback for ${provider} with code`, {
        codePresent: !!code,
        provider
      });
      
      const redirectUri = `${window.location.origin}/auth/callback`;
      await handleOAuthCallback(
        provider === 'google_drive' ? 'google_drive' : 'onedrive',
        code,
        redirectUri
      );
      
      console.log("OAuth callback processed successfully");
      
      setOauthComplete(true);
      setOauthError(null);
      
      toast({
        title: "Authentication Successful",
        description: `Successfully connected to ${provider === 'google_drive' ? 'Google Drive' : 'Microsoft OneDrive'}`,
      });
      
      return true;
    } catch (error) {
      console.error("Error handling OAuth callback:", error);
      
      setOauthError({
        error: "callback_processing_failed",
        description: error instanceof Error ? error.message : "Failed to process authorization",
        detailedMessage: "An error occurred while processing the OAuth callback. Check the browser console and network logs for more details."
      });
      
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : "Failed to complete authentication",
        variant: "destructive",
      });
      
      return false;
    }
  };

  return {
    oauthComplete,
    oauthError,
    setOauthComplete,
    setOauthError,
    handleOAuthLogin,
    processOAuthCallback
  };
};
