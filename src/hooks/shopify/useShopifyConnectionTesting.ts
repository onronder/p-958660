
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ShopifyCredential } from "../types/shopifyTypes";

export const useShopifyConnectionTesting = (
  credential: ShopifyCredential,
  onRefresh: () => void
) => {
  const [isTesting, setIsTesting] = useState(false);
  const { toast } = useToast();

  const testConnection = async () => {
    try {
      setIsTesting(true);

      // Use whichever credentials are available (supporting both old and new formats)
      const { data, error } = await supabase.functions.invoke("shopify-private", {
        body: {
          action: "test_connection",
          store_url: credential.store_name,
          api_key: credential.api_key || credential.client_id,
          api_token: credential.api_token || credential.client_secret,
          access_token: credential.access_token,
        },
      });

      if (error || data?.error) {
        console.error("Connection test failed:", error || data?.error);
        
        // Update connection status in database for sources table
        await supabase
          .from("sources")
          .update({
            credentials: {
              ...credential,
              last_connection_status: false,
              last_connection_time: new Date().toISOString(),
            },
            status: 'Failed',
            updated_at: new Date().toISOString() // Update timestamp
          })
          .eq("id", credential.id);
        
        toast({
          title: "Connection Failed",
          description: "Failed to connect to Shopify. Please check your credentials.",
          variant: "destructive",
        });
        
        onRefresh();
        return;
      }

      // Update connection status in database for sources table
      await supabase
        .from("sources")
        .update({
          credentials: {
            ...credential,
            last_connection_status: true,
            last_connection_time: new Date().toISOString(),
          },
          status: 'Active',
          updated_at: new Date().toISOString() // Update timestamp
        })
        .eq("id", credential.id);

      toast({
        title: "Connection Successful",
        description: "Successfully connected to Shopify.",
      });
      
      onRefresh();
    } catch (error) {
      console.error("Error testing connection:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return {
    isTesting,
    testConnection
  };
};
