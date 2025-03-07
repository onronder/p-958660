
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useShopifyConnection = (onSuccess: () => void) => {
  const [storeName, setStoreName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
  const [testResponseData, setTestResponseData] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const resetForm = () => {
    setStoreName("");
    setApiKey("");
    setApiToken("");
    setIsSubmitting(false);
    setIsTesting(false);
    setTestStatus("idle");
    setTestResponseData(null);
  };

  const handleTestConnection = async () => {
    if (!storeName || !apiToken) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsTesting(true);
      setTestStatus("idle");
      setTestResponseData(null);

      const formattedStoreUrl = storeName.includes(".myshopify.com")
        ? storeName
        : `${storeName}.myshopify.com`;

      console.log("Testing connection to:", formattedStoreUrl);

      const { data, error } = await supabase.functions.invoke("shopify-private", {
        body: {
          action: "test_connection",
          store_url: formattedStoreUrl,
          api_key: apiKey,
          api_token: apiToken,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        setTestStatus("error");
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to test connection",
          variant: "destructive",
        });
        return;
      }

      if (data.error) {
        console.error("Connection test failed:", data.error);
        setTestStatus("error");
        toast({
          title: "Connection Failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      // Connection successful - save test response data
      setTestResponseData(data.shop);
      setTestStatus("success");
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${formattedStoreUrl}`,
      });
    } catch (error) {
      console.error("Error testing connection:", error);
      setTestStatus("error");
      toast({
        title: "Connection Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to add a source",
        variant: "destructive",
      });
      return;
    }

    if (!storeName || !apiKey || !apiToken) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Format store URL if needed
      const formattedStoreUrl = storeName.includes(".myshopify.com")
        ? storeName
        : `${storeName}.myshopify.com`;

      // If we haven't tested the connection yet, do it now
      if (testStatus !== "success") {
        const { data, error } = await supabase.functions.invoke("shopify-private", {
          body: {
            action: "test_connection",
            store_url: formattedStoreUrl,
            api_key: apiKey,
            api_token: apiToken,
          },
        });

        if (error || data.error) {
          console.error("Connection test failed:", error || data.error);
          toast({
            title: "Connection Failed",
            description: "Please test your connection before saving",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        // If test was successful but testResponseData is empty, store the shop data
        if (!testResponseData && data.shop) {
          setTestResponseData(data.shop);
        }
      }

      // Prepare store data to save
      const shopName = testResponseData?.name || formattedStoreUrl;

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
        return;
      }

      // Log the inserted record ID to confirm it was saved
      console.log("Saved credentials with ID:", insertedData[0]?.id);

      toast({
        title: "Success",
        description: "Shopify credentials saved successfully",
      });

      resetForm();
      onSuccess();
    } catch (error) {
      console.error("Error saving credentials:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    storeName,
    setStoreName,
    apiKey,
    setApiKey,
    apiToken,
    setApiToken,
    isSubmitting,
    isTesting,
    testStatus,
    testResponseData,
    resetForm,
    handleTestConnection,
    handleSubmit,
  };
};
