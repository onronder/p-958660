
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
      
      const { data, error: fetchError } = await fetchUserCredentials(user.id);
      
      if (fetchError) {
        handleError(fetchError, "Failed to load Shopify credentials");
        return;
      }
      
      setCredentials(data || []);
    } catch (unexpectedError) {
      handleUnexpectedError(unexpectedError);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Separate fetch function for better separation of concerns
  const fetchUserCredentials = async (userId: string) => {
    return await supabase
      .from("shopify_credentials")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
  };

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

  // Add a new credential
  const addCredential = useCallback(async (newCredential: Omit<ShopifyCredential, 'id' | 'created_at'> & { user_id: string }) => {
    try {
      setError(null);
      
      const { data, error: insertError } = await supabase
        .from("shopify_credentials")
        .insert(newCredential)
        .select();
      
      if (insertError) {
        handleError(insertError, "Failed to add Shopify credential");
        return null;
      }
      
      toast({
        title: "Success",
        description: "Shopify credential added successfully",
      });
      
      await loadCredentials();
      return data?.[0] || null;
    } catch (unexpectedError) {
      handleUnexpectedError(unexpectedError);
      return null;
    }
  }, [loadCredentials]);

  // Delete a credential
  const deleteCredential = useCallback(async (credentialId: string) => {
    try {
      setError(null);
      
      const { error: deleteError } = await supabase
        .from("shopify_credentials")
        .delete()
        .eq("id", credentialId);
      
      if (deleteError) {
        handleError(deleteError, "Failed to delete credential");
        return false;
      }
      
      toast({
        title: "Success",
        description: "Shopify credential deleted successfully",
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
      
      const { error: updateError } = await supabase
        .from("shopify_credentials")
        .update({
          last_connection_status: status,
          last_connection_time: new Date().toISOString(),
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
    addCredential,
    deleteCredential,
    updateConnectionStatus
  };
};
