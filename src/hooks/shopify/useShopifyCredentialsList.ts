
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ShopifyCredential } from "../types/shopifyTypes";

export const useShopifyCredentialsList = () => {
  const [credentials, setCredentials] = useState<ShopifyCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Error handling helpers
  const handleError = (error: any, message: string) => {
    console.error(`${message}:`, error);
    setError(error.message || message);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  const handleUnexpectedError = (error: any) => {
    console.error("Unexpected error in Shopify credentials:", error);
    setError("An unexpected error occurred");
    toast({
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive",
    });
  };

  const loadCredentials = useCallback(async () => {
    if (!user) {
      setCredentials([]);
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch from the sources table instead of shopify_credentials
      const { data, error: fetchError } = await supabase
        .from("sources")
        .select("*")
        .eq("user_id", user.id)
        .eq("source_type", "Shopify")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      
      if (fetchError) {
        handleError(fetchError, "Failed to load Shopify credentials");
        return;
      }

      // Map sources to ShopifyCredential format for backward compatibility
      const shopifySources: ShopifyCredential[] = data?.map(source => {
        // Cast credentials to a Record type before accessing properties
        const creds = source.credentials as Record<string, any> || {};
        
        return {
          id: source.id,
          store_name: source.url || '',
          client_id: creds.client_id || '',
          client_secret: creds.client_secret || '',
          access_token: creds.access_token || '',
          // Include legacy fields for backward compatibility
          api_key: creds.api_key || '',
          api_token: creds.api_token || '',
          last_connection_status: creds.last_connection_status || null,
          last_connection_time: creds.last_connection_time || null,
          created_at: source.created_at
        };
      }) || [];
      
      setCredentials(shopifySources);
    } catch (unexpectedError) {
      handleUnexpectedError(unexpectedError);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load credentials on component mount or when user changes
  useEffect(() => {
    if (user) {
      loadCredentials();
    }
  }, [user, loadCredentials]);

  return {
    credentials,
    isLoading,
    error,
    loadCredentials
  };
};
