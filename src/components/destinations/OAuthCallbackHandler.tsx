
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * This component handles OAuth callbacks from Google Drive and OneDrive.
 * It extracts the code parameter from the URL and sends it to the parent window.
 */
const OAuthCallbackHandler: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  useEffect(() => {
    // Extract the code and state from the URL
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    console.log("OAuth callback received with params:", { 
      code: code ? "present" : "missing", 
      state, 
      error, 
      errorDescription,
      fullUrl: window.location.href,
      search: location.search
    });
    
    if (error) {
      console.error("OAuth error:", error, errorDescription);
      console.error("Full error URL:", window.location.href);
      
      // Special handling for access_denied error (unverified app)
      let errorMessage = errorDescription || "Authentication failed";
      let detailedMessage = "";
      
      if (error === "access_denied") {
        errorMessage = "Application not verified";
        detailedMessage = "The OAuth application is still in testing mode. You need to be added as a test user in Google Cloud Console.";
      }
      
      // Handle redirect_uri_mismatch error
      if (error === "redirect_uri_mismatch" || errorDescription?.includes("redirect_uri_mismatch")) {
        errorMessage = "Redirect URI mismatch";
        detailedMessage = "The redirect URI in the request doesn't match the one registered in the OAuth provider. Please ensure that the URL " + 
                          window.location.origin + "/auth/callback is registered in your Google/Microsoft developer console.";
        
        console.error("Redirect URI mismatch details:", {
          callbackUrl: window.location.origin + "/auth/callback",
          currentUrl: window.location.href,
          origin: window.location.origin
        });
      }
      
      setStatus('error');
      setErrorDetails(`${errorMessage}: ${detailedMessage}`);
      
      // Handle the error by showing a message or redirecting
      if (window.opener) {
        console.log("Sending OAuth error to parent window:", { 
          error, 
          description: errorMessage, 
          detailedMessage 
        });
        
        window.opener.postMessage({ 
          type: 'oauth_error', 
          error,
          description: errorMessage,
          detailedMessage
        }, window.location.origin);
        
        setTimeout(() => {
          window.close();
        }, 5000); // Keep window open longer to show error
      } else {
        console.log("No opener window found, redirecting to destinations with error");
        setTimeout(() => {
          navigate('/destinations', { 
            state: { 
              oauthError: error, 
              description: errorMessage,
              detailedMessage
            } 
          });
        }, 5000); // Delay redirect to show error
      }
      return;
    }
    
    if (code) {
      // Determine the provider based on the state parameter or URL
      let provider = 'unknown';
      let origin = window.location.origin; // Default to current origin
      
      if (state) {
        try {
          const stateObj = JSON.parse(state);
          provider = stateObj.provider || 'unknown';
          origin = stateObj.origin || window.location.origin;
          console.log("Provider extracted from state:", provider);
          console.log("Origin extracted from state:", origin);
          console.log("Full state object:", stateObj);
        } catch (e) {
          console.error("Failed to parse state parameter:", e);
          provider = state; // If state is not JSON, use it directly
        }
      } else {
        // Try to determine provider from the referrer
        const referrer = document.referrer.toLowerCase();
        if (referrer.includes('google')) {
          provider = 'google_drive';
        } else if (referrer.includes('microsoft') || referrer.includes('live')) {
          provider = 'onedrive';
        }
        console.log("Provider determined from referrer:", provider, "Full referrer:", referrer);
      }
      
      setStatus('success');
      
      // Send the code back to the parent window
      if (window.opener) {
        console.log("Sending OAuth callback to parent window:", { 
          code: "present", 
          provider,
          targetOrigin: origin,
          currentOrigin: window.location.origin
        });
        
        window.opener.postMessage({ type: 'oauth_callback', code, provider }, origin);
        
        // Close this window after a brief delay to ensure the message was sent
        setTimeout(() => {
          window.close();
        }, 1000);
      } else {
        console.log("No opener window found, redirecting to destinations with OAuth data");
        // If there's no opener, redirect to the main page
        navigate('/destinations', { state: { oauth: { code, provider } } });
      }
    } else {
      // If there's no code, show an error
      setStatus('error');
      setErrorDetails('No code parameter found in OAuth callback URL');
      console.error('No code parameter found in OAuth callback URL:', window.location.href);
    }
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">
          {status === 'processing' && "Authentication in progress..."}
          {status === 'success' && "Authentication successful!"}
          {status === 'error' && "Authentication failed"}
        </h1>
        
        {status === 'processing' && (
          <>
            <p className="mb-2">Please wait while we complete the authentication process.</p>
            <p className="text-sm text-muted-foreground">You can close this window after the process completes.</p>
          </>
        )}
        
        {status === 'success' && (
          <p className="mb-2">You have successfully authenticated. This window will close automatically.</p>
        )}
        
        {status === 'error' && errorDetails && (
          <div className="mt-2 p-4 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-destructive font-medium">Error: {errorDetails}</p>
            <p className="mt-2 text-sm">If you're seeing this error, check that you've:</p>
            <ul className="text-sm list-disc list-inside mt-1 text-left">
              <li>Set up OAuth correctly in Google Cloud Console</li>
              <li>Added yourself as a test user if using an unverified app</li>
              <li>Added <code className="bg-muted p-1 rounded">{window.location.origin}/auth/callback</code> as an authorized redirect URI</li>
            </ul>
          </div>
        )}
        
        <div className="mt-6">
          {status === 'processing' && (
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OAuthCallbackHandler;
