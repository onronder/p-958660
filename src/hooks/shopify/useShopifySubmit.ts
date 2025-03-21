
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useShopifySubmit = (onSuccess: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const submitCredentials = async (
    storeName: string, 
    clientId: string, 
    clientSecret: string, 
    accessToken: string,
    testResponseData: any,
    hasTestedSuccessfully: boolean
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to add a source",
        variant: "destructive",
      });
      return false;
    }

    if (!storeName || !clientId || !clientSecret || !accessToken) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsSubmitting(true);

      // Format store URL if needed
      const formattedStoreUrl = storeName.includes(".myshopify.com")
        ? storeName
        : `${storeName}.myshopify.com`;

      // If we haven't tested the connection yet, don't proceed
      if (!hasTestedSuccessfully) {
        toast({
          title: "Connection Failed",
          description: "Please test your connection before saving",
          variant: "destructive",
        });
        return false;
      }

      // Insert source into the sources table
      const { data: insertedData, error: insertError } = await supabase
        .from("sources")
        .insert({
          user_id: user.id,
          name: formattedStoreUrl.split('.')[0], // Use store name as the source name
          source_type: "Shopify",
          url: formattedStoreUrl,
          status: "Active",
          credentials: {
            client_id: clientId,
            client_secret: clientSecret,
            access_token: accessToken,
            last_connection_status: true,
            last_connection_time: new Date().toISOString(),
            store_details: testResponseData
          },
          updated_at: new Date().toISOString() // Explicitly set updated_at timestamp
        })
        .select('id');

      if (insertError) {
        console.error("Error inserting source:", insertError);
        toast({
          title: "Error",
          description: insertError.message || "Failed to save source",
          variant: "destructive",
        });
        return false;
      }

      // Log the inserted record ID to confirm it was saved
      console.log("Saved source with ID:", insertedData[0]?.id);

      toast({
        title: "Success",
        description: "Shopify source added successfully",
      });

      onSuccess();
      return true;
    } catch (error) {
      console.error("Error saving source:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCredentials = async (
    sourceId: string,
    clientId: string, 
    clientSecret: string,
    accessToken: string,
    testResponseData: any,
    hasTestedSuccessfully: boolean
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to update a source",
        variant: "destructive",
      });
      return false;
    }

    if (!clientId || !clientSecret || !accessToken) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsSubmitting(true);

      // Get current credentials
      const { data: sourceData, error: getError } = await supabase
        .from("sources")
        .select("credentials")
        .eq("id", sourceId)
        .single();
        
      if (getError) {
        console.error("Error fetching source:", getError);
        toast({
          title: "Error",
          description: "Failed to fetch source data",
          variant: "destructive",
        });
        return false;
      }
      
      // Cast credentials to Record type for type safety
      const currentCreds = sourceData.credentials as Record<string, any> || {};
      
      // Update credentials with new values
      const updatedCredentials = {
        ...currentCreds,
        client_id: clientId,
        client_secret: clientSecret,
        access_token: accessToken,
        last_connection_status: hasTestedSuccessfully ? true : currentCreds.last_connection_status,
        last_connection_time: hasTestedSuccessfully ? new Date().toISOString() : currentCreds.last_connection_time,
        store_details: testResponseData || currentCreds.store_details
      };

      // Update source
      const { error: updateError } = await supabase
        .from("sources")
        .update({
          credentials: updatedCredentials,
          updated_at: new Date().toISOString() // Explicitly update the timestamp
        })
        .eq("id", sourceId);
      
      if (updateError) {
        console.error("Error updating source:", updateError);
        toast({
          title: "Error",
          description: updateError.message || "Failed to update source",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Shopify source updated successfully",
      });

      onSuccess();
      return true;
    } catch (error) {
      console.error("Error updating source:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitCredentials,
    updateCredentials
  };
};
