
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useGraphQLSchema = (sourceId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [schema, setSchema] = useState<any>(null);
  
  const loadSchema = useCallback(async () => {
    if (!sourceId) return;
    
    try {
      setIsLoading(true);
      
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No authenticated session");
      }
      
      // Call the Shopify schema edge function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-schema`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          source_id: sourceId,
          api_version: "2023-10" // Could be made configurable
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load schema");
      }
      
      const data = await response.json();
      setSchema(data.schema);
    } catch (error) {
      console.error("Error loading schema:", error);
      toast({
        title: "Error",
        description: "Failed to load GraphQL schema: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [sourceId]);
  
  useEffect(() => {
    loadSchema();
  }, [loadSchema]);
  
  return {
    isLoading,
    schema,
    loadSchema
  };
};
