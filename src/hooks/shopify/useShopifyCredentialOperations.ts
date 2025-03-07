
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ShopifyCredential } from "../types/shopifyTypes";

export const useShopifyCredentialOperations = (
  loadCredentials: () => Promise<void>,
  selectedCredential: ShopifyCredential | null
) => {
  const { toast } = useToast();

  // Error handling helpers
  const handleError = (error: any, message: string) => {
    console.error(`${message}:`, error);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  const handleUnexpectedError = (error: any) => {
    console.error("Unexpected error in Shopify credentials:", error);
    toast({
      title: "Error",
      description: "An unexpected error occurred. Please try again.",
      variant: "destructive",
    });
  };

  // Delete a credential
  const deleteCredential = useCallback(async (credentialId: string) => {
    try {
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
      
      await loadCredentials();
      return true;
    } catch (unexpectedError) {
      handleUnexpectedError(unexpectedError);
      return false;
    }
  }, [loadCredentials]);

  // Update a credential connection status
  const updateConnectionStatus = useCallback(async (credentialId: string, status: boolean) => {
    try {
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
      
      // Update credentials object - properly cast to Record for type safety
      const currentCreds = sourceData.credentials as Record<string, any> || {};
      const updatedCredentials = {
        ...currentCreds,
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
    deleteCredential,
    updateConnectionStatus
  };
};
