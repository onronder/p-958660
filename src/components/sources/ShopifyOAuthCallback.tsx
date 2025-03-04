
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const shop = urlParams.get('shop');
        
        if (!code || !shop) {
          throw new Error("Missing required parameters");
        }
        
        // Get saved state from localStorage
        const savedStateJSON = localStorage.getItem('shopifyOAuthState');
        if (!savedStateJSON) {
          throw new Error("No saved state found");
        }
        
        const savedState: OAuthState = JSON.parse(savedStateJSON);
        
        // Exchange authorization code for access token
        const { data: tokenData, error: tokenError } = await supabase.functions.invoke("shopify-oauth", {
          body: {
            pathname: "/shopify-oauth/callback",
            code,
            shop
          }
        });
        
        if (tokenError || !tokenData.access_token) {
          throw new Error(tokenError?.message || "Failed to obtain access token");
        }
        
        // Save the token to the database
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
          throw new Error(saveError.message);
        }
        
        // Clean up
        localStorage.removeItem('shopifyOAuthState');
        
        toast({
          title: "Success!",
          description: "Your Shopify store has been connected.",
        });
        
        // Redirect to the sources page
        navigate("/sources");
      } catch (error) {
        console.error("OAuth callback error:", error);
        setError(error.message);
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to complete Shopify authentication",
          variant: "destructive",
        });
      }
    };
    
    handleCallback();
  }, [navigate, toast]);

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
