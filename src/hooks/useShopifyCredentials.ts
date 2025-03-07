
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Source } from "@/types/source";

export interface ShopifyCredential {
  id: string;
  store_name: string;
  api_key: string;
  api_token: string;
  last_connection_status: boolean | null;
  last_connection_time: string | null;
  created_at: string;
}

export const useShopifyCredentials = () => {
  const [credentials, setCredentials] = useState<ShopifyCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCredential, setSelectedCredential] = useState<ShopifyCredential | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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
        .order("created_at", { ascending: false });
      
      if (fetchError) {
        handleError(fetchError, "Failed to load Shopify credentials");
        return;
      }

      // Map sources to ShopifyCredential format for backward compatibility
      const shopifySources = data?.map(source => ({
        id: source.id,
        store_name: source.url,
        api_key: source.credentials?.api_key || "",
        api_token: source.credentials?.api_token || "",
        last_connection_status: source.credentials?.last_connection_status || null,
        last_connection_time: source.credentials?.last_connection_time || null,
        created_at: source.created_at
      })) || [];
      
      setCredentials(shopifySources);
    } catch (unexpectedError) {
      handleUnexpectedError(unexpectedError);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

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

  // Load credentials on component mount or when user changes
  useEffect(() => {
    if (user) {
      loadCredentials();
    }
  }, [user, loadCredentials]);

  // Select a credential by ID
  const selectCredentialById = useCallback((credentialId: string) => {
    const credential = credentials.find(cred => cred.id === credentialId);
    setSelectedCredential(credential || null);
    return credential;
  }, [credentials]);

  // Delete a credential
  const deleteCredential = useCallback(async (credentialId: string) => {
    try {
      setError(null);
      
      // Delete from sources table
      const { error: deleteError } = await supabase
        .from("sources")
        .delete()
        .eq("id", credentialId);
      
      if (deleteError) {
        handleError(deleteError, "Failed to delete credential");
        return false;
      }
      
      toast({
        title: "Success",
        description: "Shopify source deleted successfully",
      });
      
      if (selectedCredential?.id === credentialId) {
        setSelectedCredential(null);
      }
      
      await loadCredentials();
      return true;
    } catch (unexpectedError) {
      handleUnexpectedError(unexpectedError);
      return false;
    }
  }, [selectedCredential, loadCredentials]);

  // Update a credential connection status
  const updateConnectionStatus = useCallback(async (credentialId: string, status: boolean) => {
    try {
      setError(null);
      
      // Get current credentials first
      const { data: sourceData, error: getError } = await supabase
        .from("sources")
        .select("credentials")
        .eq("id", credentialId)
        .single();
        
      if (getError) {
        handleError(getError, "Failed to get current source data");
        return false;
      }
      
      // Update credentials object
      const updatedCredentials = {
        ...(sourceData.credentials as Record<string, any> || {}),
        last_connection_status: status,
        last_connection_time: new Date().toISOString(),
      };
      
      // Update in sources table
      const { error: updateError } = await supabase
        .from("sources")
        .update({
          credentials: updatedCredentials,
          status: status ? "Active" : "Failed"
        })
        .eq("id", credentialId);
      
      if (updateError) {
        handleError(updateError, "Failed to update connection status");
        return false;
      }
      
      await loadCredentials();
      return true;
    } catch (unexpectedError) {
      handleUnexpectedError(unexpectedError);
      return false;
    }
  }, [loadCredentials]);

  return {
    credentials,
    isLoading,
    error,
    selectedCredential,
    setSelectedCredential,
    loadCredentials,
    selectCredentialById,
    deleteCredential,
    updateConnectionStatus
  };
};
