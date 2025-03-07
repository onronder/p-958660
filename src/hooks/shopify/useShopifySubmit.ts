
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

      // Insert credentials into database
      const { data: insertedData, error: insertError } = await supabase
        .from("shopify_credentials")
        .insert({
          user_id: user.id,
          store_name: formattedStoreUrl,
          api_key: apiKey,
          api_token: apiToken,
          last_connection_status: true,
          last_connection_time: new Date().toISOString(),
        })
        .select('id');

      if (insertError) {
        console.error("Error inserting credentials:", insertError);
        toast({
          title: "Error",
          description: insertError.message || "Failed to save credentials",
          variant: "destructive",
        });
        return false;
      }

      // Log the inserted record ID to confirm it was saved
      console.log("Saved credentials with ID:", insertedData[0]?.id);

      toast({
        title: "Success",
        description: "Shopify credentials saved successfully",
      });

      onSuccess();
      return true;
    } catch (error) {
      console.error("Error saving credentials:", error);
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
