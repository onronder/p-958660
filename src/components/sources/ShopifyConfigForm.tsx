
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ShopifyConfigFormProps {
  sourceName: string;
  setSourceName: (value: string) => void;
  storeUrl: string;
  setStoreUrl: (value: string) => void;
  onComplete: () => void;
}

const ShopifyConfigForm: React.FC<ShopifyConfigFormProps> = ({
  sourceName,
  setSourceName,
  storeUrl,
  setStoreUrl,
  onComplete
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleConnectClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!storeUrl) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid Shopify store name",
        variant: "destructive",
      });
      return;
    }

    // Format the store URL if needed
    const formattedStoreUrl = storeUrl.includes(".myshopify.com") 
      ? storeUrl 
      : `${storeUrl}.myshopify.com`;
    
    try {
      setIsLoading(true);
      console.log("Starting OAuth flow with store:", formattedStoreUrl);
      
      // Call the Supabase edge function to get auth URL
      console.log("Calling Supabase edge function for authentication URL");
      const { data, error } = await supabase.functions.invoke("shopify-oauth", {
        body: {
          pathname: "/shopify-oauth/authenticate",
          store_name: formattedStoreUrl,
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message);
      }
      
      console.log("Edge function response:", data);
      
      if (!data || !data.auth_url) {
        console.error("Invalid response from edge function:", data);
        throw new Error("Failed to generate authorization URL");
      }
      
      // Save the current state to localStorage so we can retrieve it after redirect
      const stateData = {
        sourceName,
        storeUrl: formattedStoreUrl,
        userId: user?.id
      };
      console.log("Saving OAuth state to localStorage:", stateData);
      localStorage.setItem('shopifyOAuthState', JSON.stringify(stateData));
      
      // Redirect to Shopify authorization page
      console.log("Redirecting to Shopify auth URL:", data.auth_url);
      window.location.href = data.auth_url;
    } catch (error) {
      console.error("Error initiating OAuth:", error);
      toast({
        title: "Connection Error",
        description: `Failed to connect to Shopify: ${error.message || "Unknown error"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="space-y-2">
        <Label htmlFor="sourceName">Source Name</Label>
        <Input
          id="sourceName"
          placeholder="My Shopify Store"
          value={sourceName}
          onChange={(e) => setSourceName(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="storeUrl">Store URL</Label>
        <Input
          id="storeUrl"
          placeholder="mystore.myshopify.com"
          value={storeUrl}
          onChange={(e) => setStoreUrl(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Enter your store name (e.g., mystore.myshopify.com)
        </p>
      </div>
      
      <div className="mt-2">
        <Button 
          onClick={handleConnectClick} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Connecting..." : "Connect to Shopify"}
        </Button>
      </div>
    </div>
  );
};

export default ShopifyConfigForm;
