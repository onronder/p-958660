
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ShopifyTestResult {
  status: "idle" | "success" | "error";
  responseData: any;
  errorType?: string;
  errorDetails?: any;
}

export const useShopifyConnectionTest = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
  const [testResponseData, setTestResponseData] = useState<any>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [errorType, setErrorType] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const resetTestState = () => {
    setIsTesting(false);
    setTestStatus("idle");
    setTestResponseData(null);
    setErrorDetails(null);
    setErrorType(null);
  };

  const getErrorMessage = (error: any, defaultMessage: string = "An unexpected error occurred") => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return defaultMessage;
  };

  const testConnection = async (storeName: string, clientId: string, clientSecret: string, accessToken: string) => {
    if (!storeName || !clientId || !clientSecret || !accessToken) {
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
      setErrorDetails(null);
      setErrorType(null);

      const formattedStoreUrl = storeName.includes(".myshopify.com")
        ? storeName
        : `${storeName}.myshopify.com`;

      console.log("Testing connection to:", formattedStoreUrl);

      const { data, error } = await supabase.functions.invoke("shopify-private", {
        body: {
          action: "test_connection",
          store_url: formattedStoreUrl,
          client_id: clientId,
          client_secret: clientSecret,
          access_token: accessToken,
          user_id: user?.id // Pass user_id for logging
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        setTestStatus("error");
        setErrorType("edge_function_error");
        setErrorDetails(error);
        
        toast({
          title: "Connection Failed",
          description: getErrorMessage(error, "Failed to test connection"),
          variant: "destructive",
        });
        return false;
      }

      if (data.error) {
        console.error("Connection test failed:", data.error);
        setTestStatus("error");
        setErrorType(data.errorType || "unknown_error");
        setErrorDetails(data.details);
        
        // Provide more specific error messages
        let errorDescription = data.error;
        if (data.errorType === "auth_error") {
          errorDescription = "Invalid API credentials. Please check your client ID, client secret, or access token.";
        } else if (data.errorType === "store_not_found") {
          errorDescription = "Store not found. Please verify your store URL.";
        } else if (data.errorType === "permission_error") {
          errorDescription = "Your API credentials don't have sufficient permissions.";
        } else if (data.errorType === "network_error") {
          errorDescription = "Network error. Please check your internet connection and try again.";
        }
        
        toast({
          title: "Connection Failed",
          description: errorDescription,
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
      setErrorType("unexpected_error");
      setErrorDetails(error);
      
      toast({
        title: "Connection Failed",
        description: getErrorMessage(error),
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
    errorDetails,
    errorType,
    resetTestState,
    testConnection,
  };
};
