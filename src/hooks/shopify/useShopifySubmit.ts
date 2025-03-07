
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
    apiKey: string, 
    apiToken: string,
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

    if (!storeName || !apiKey || !apiToken) {
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

      // Insert source into the sources table instead of shopify_credentials
      const { data: insertedData, error: insertError } = await supabase
        .from("sources")
        .insert({
          user_id: user.id,
          name: formattedStoreUrl.split('.')[0], // Use store name as the source name
          source_type: "Shopify",
          url: formattedStoreUrl,
          status: "Active",
          credentials: {
            api_key: apiKey,
            api_token: apiToken,
            last_connection_status: true,
            last_connection_time: new Date().toISOString(),
            store_details: testResponseData
          }
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

  return {
    isSubmitting,
    submitCredentials,
  };
};
