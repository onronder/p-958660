
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { devLogger } from "@/utils/DevLogger";

export const useGraphQLSchema = (sourceId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [schema, setSchema] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [cachedAt, setCachedAt] = useState<string | null>(null);
  
  const loadSchema = useCallback(async (forceRefresh = false) => {
    if (!sourceId) {
      setError("No source selected");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      devLogger.info("GraphQLSchema", `Loading schema for source ID: ${sourceId}`, { forceRefresh });
      
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
          force_refresh: forceRefresh
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load schema");
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "No schema returned from the server");
      }
      
      devLogger.info("GraphQLSchema", `Schema loaded successfully: ${data.is_cached ? 'from cache' : 'fresh fetch'}`);
      setSchema(data.schema);
      setIsCached(data.is_cached || false);
      setCachedAt(data.cached_at || null);
      
    } catch (error) {
      devLogger.error("GraphQLSchema", "Error loading schema", error);
      setError(error.message);
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
    if (sourceId) {
      loadSchema();
    }
  }, [sourceId, loadSchema]);
  
  return {
    isLoading,
    schema,
    error,
    isCached,
    cachedAt,
    loadSchema,
    refreshSchema: () => loadSchema(true)
  };
};
