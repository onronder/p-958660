
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OAuthState {
  sourceName: string;
  storeUrl: string;
  userId: string;
}

const ShopifyOAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Log the full callback URL (without sensitive parameters)
        console.log("OAuth callback URL path:", location.pathname + location.search.replace(/code=[^&]+/, "code=REDACTED"));
        
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const shop = urlParams.get('shop');
        
        console.log("OAuth callback parameters received:", { 
          hasCode: Boolean(code), 
          shop: shop 
        });
        
        if (!code || !shop) {
          throw new Error("Missing required parameters");
        }
        
        // Get saved state from localStorage
        const savedStateJSON = localStorage.getItem('shopifyOAuthState');
        console.log("Retrieved saved state from localStorage:", Boolean(savedStateJSON));
        
        if (!savedStateJSON) {
          throw new Error("No saved state found");
        }
        
        const savedState: OAuthState = JSON.parse(savedStateJSON);
        console.log("Parsed saved state:", { 
          hasSourceName: Boolean(savedState.sourceName),
          storeUrl: savedState.storeUrl,
          hasUserId: Boolean(savedState.userId)
        });
        
        // Exchange authorization code for access token
        console.log("Exchanging authorization code for access token...");
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke("shopify-oauth", {
          body: {
            pathname: "/shopify-oauth/callback",
            code,
            shop
          }
        });
        
        if (tokenError) {
          console.error("Token exchange error:", tokenError);
          throw new Error(tokenError.message || "Failed to obtain access token");
        }
        
        console.log("Token exchange response:", {
          success: Boolean(tokenData),
          hasAccessToken: Boolean(tokenData?.access_token)
        });
        
        if (!tokenData || !tokenData.access_token) {
          throw new Error("Failed to obtain access token");
        }
        
        // Save the token to the database
        console.log("Saving token to database...");
        const { data: saveData, error: saveError } = await supabase.functions.invoke("shopify-oauth", {
          body: {
            pathname: "/shopify-oauth/save-token",
            user_id: savedState.userId,
            store_name: shop,
            access_token: tokenData.access_token,
            source_name: savedState.sourceName
          }
        });
        
        if (saveError) {
          console.error("Error saving token:", saveError);
          throw new Error(saveError.message || "Failed to save connection");
        }
        
        console.log("Token saved successfully:", { 
          success: Boolean(saveData?.success),
          sourceId: saveData?.source_id
        });
        
        // Clean up
        localStorage.removeItem('shopifyOAuthState');
        
        toast({
          title: "Success!",
          description: "Your Shopify store has been connected.",
        });
        
        // Redirect to the sources page
        console.log("Redirecting to sources page...");
        navigate("/sources");
      } catch (error) {
        console.error("OAuth callback error:", error);
        setError(error.message || "An unknown error occurred");
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to complete Shopify authentication",
          variant: "destructive",
        });
      }
    };
    
    handleCallback();
  }, [navigate, toast, location]);

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold text-red-500">Authentication Error</h2>
            <p>{error}</p>
            <button 
              className="text-primary hover:underline" 
              onClick={() => navigate("/sources/add")}
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <h2 className="text-xl font-semibold">Completing Shopify Authentication</h2>
          <p>Please wait while we finish setting up your connection...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShopifyOAuthCallback;
