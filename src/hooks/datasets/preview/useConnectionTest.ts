
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to handle testing connection to a Shopify data source
 */
export const useConnectionTest = (sourceId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    message: string;
  } | undefined>(undefined);

  /**
   * Test connection to the source
   */
  const testConnection = useCallback(async () => {
    if (!sourceId) {
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke("shopify-extract", {
        body: {
          extraction_id: "preview",
          source_id: sourceId,
          custom_query: `
            query {
              shop {
                name
                myshopifyDomain
              }
            }
          `,
          preview_only: true,
          limit: 1
        }
      });

      if (functionError) {
        console.error("Connection test error:", functionError);
        setConnectionTestResult({
          success: false,
          message: functionError.message || "Connection failed. Please check your credentials and try again."
        });
        return;
      }

      if (data.error) {
        console.error("Connection test API error:", data.error);
        setConnectionTestResult({
          success: false,
          message: data.error || "Connection failed. Please check your credentials and try again."
        });
        return;
      }

      console.log("Connection test successful:", data);
      setConnectionTestResult({
        success: true,
        message: "Successfully connected to Shopify store."
      });
      
    } catch (err: any) {
      console.error("Connection test exception:", err);
      setConnectionTestResult({
        success: false,
        message: err.message || "Connection failed. Please check your credentials and try again."
      });
    } finally {
      setIsLoading(false);
    }
  }, [sourceId]);

  return {
    isLoading,
    connectionTestResult,
    testConnection
  };
};
