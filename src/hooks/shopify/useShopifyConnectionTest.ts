
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ShopifyTestResult {
  status: "idle" | "success" | "error";
  responseData: any;
}

export const useShopifyConnectionTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
  const [testResponseData, setTestResponseData] = useState<any>(null);
  const { toast } = useToast();

  const resetTestState = () => {
    setIsTesting(false);
    setTestStatus("idle");
    setTestResponseData(null);
  };

  const testConnection = async (storeName: string, apiKey: string, apiToken: string) => {
    if (!storeName || !apiToken) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
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
        return false;
      }

      if (data.error) {
        console.error("Connection test failed:", data.error);
        setTestStatus("error");
        toast({
          title: "Connection Failed",
          description: data.error || "Invalid credentials",
          variant: "destructive",
        });
        return false;
      }

      // Connection successful - save test response data
      setTestResponseData(data.shop);
      setTestStatus("success");
      toast({
        title: "Connection Successful",
        description: `Successfully connected to ${formattedStoreUrl}`,
      });
      return true;
    } catch (error) {
      console.error("Error testing connection:", error);
      setTestStatus("error");
      toast({
        title: "Connection Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsTesting(false);
    }
  };

  return {
    isTesting,
    testStatus,
    testResponseData,
    resetTestState,
    testConnection,
  };
};
