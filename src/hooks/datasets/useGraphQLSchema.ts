
import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const useGraphQLSchema = (sourceId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [schema, setSchema] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const loadSchema = useCallback(async () => {
    if (!sourceId) {
      setError("No source selected");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Loading schema for source ID:", sourceId);
      
      // Check for cached schema first
      const { data: cachedSchema, error: cacheError } = await supabase
        .from("schema_cache")
        .select("schema, cached_at")
        .eq("source_id", sourceId)
        .order("cached_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      // If we have a recent cache (less than 4 hours old), use it
      if (cachedSchema && !cacheError) {
        const cacheAge = Date.now() - new Date(cachedSchema.cached_at).getTime();
        const cacheAgeHours = cacheAge / (1000 * 60 * 60);
        
        if (cacheAgeHours < 4) {
          console.log("Using cached schema, age:", cacheAgeHours.toFixed(2), "hours");
          setSchema(cachedSchema.schema);
          setIsLoading(false);
          return;
        }
      }
      
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No authenticated session");
      }
      
      console.log("Fetching fresh schema from Shopify API");
      
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
      
      if (!data.schema) {
        throw new Error("No schema returned from the server");
      }
      
      console.log("Schema loaded successfully");
      setSchema(data.schema);
      
      // Cache the schema for future use
      await supabase
        .from("schema_cache")
        .upsert({
          source_id: sourceId,
          schema: data.schema,
          api_version: "2023-10",
          cached_at: new Date().toISOString()
        });
      
    } catch (error) {
      console.error("Error loading schema:", error);
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
    loadSchema
  };
};
