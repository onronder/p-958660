
import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { devLogger } from "@/utils/DevLogger";
import { getSupabaseUrl } from "@/hooks/destinations/api/apiUtils";

export function useSchemaCache() {
  const [status, setStatus] = useState<Record<string, SchemaCacheStatus>>({});
  const { user } = useAuth();

  interface SchemaCacheStatus {
    isCaching: boolean;
    lastCached: string | null;
    error: string | null;
  }

  const refreshSchema = useCallback(async (sourceId: string, forceFresh: boolean = false) => {
    if (!sourceId || !user) {
      toast({
        title: "Error",
        description: "Invalid source or user not authenticated",
        variant: "destructive",
      });
      return;
    }

    try {
      // Set loading state for this specific source
      setStatus(prev => ({
        ...prev,
        [sourceId]: {
          ...prev[sourceId],
          isCaching: true,
          error: null
        }
      }));

      devLogger.info("SchemaCache", `Starting schema refresh for source ${sourceId}`, { forceFresh });

      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No authenticated session");
      }
      
      const supabaseUrl = getSupabaseUrl();
      
      // Call the edge function to fetch and cache the schema
      const response = await fetch(`${supabaseUrl}/functions/v1/shopify-schema`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          source_id: sourceId,
          force_refresh: forceFresh
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from shopify-schema:", response.status, errorText);
        try {
          // Try to parse error as JSON if possible
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error || "Failed to refresh schema");
        } catch (parseError) {
          // If parsing fails, use the raw text
          throw new Error(`HTTP error ${response.status}: ${errorText || "Unknown error"}`);
        }
      }
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        throw new Error("Invalid response from server - failed to parse JSON");
      }
      
      if (!data || !data.success) {
        throw new Error(data?.message || "Unknown error refreshing schema");
      }

      // Update status with success
      setStatus(prev => ({
        ...prev,
        [sourceId]: {
          isCaching: false,
          lastCached: new Date().toISOString(),
          error: null
        }
      }));

      toast({
        title: "Schema refreshed",
        description: `GraphQL schema successfully updated (API v${data.api_version})`,
      });

      return data;
      
    } catch (error) {
      devLogger.error("SchemaCache", "Failed to refresh schema", error);
      
      // Update status with error
      setStatus(prev => ({
        ...prev,
        [sourceId]: {
          ...prev[sourceId],
          isCaching: false,
          error: error.message
        }
      }));
      
      toast({
        title: "Schema refresh failed",
        description: error.message || "An error occurred while refreshing the schema",
        variant: "destructive",
      });
    }
  }, [user]);

  // Check cache status - when was this source's schema last updated
  const checkCacheStatus = useCallback(async (sourceId: string) => {
    if (!sourceId) return null;
    
    try {
      const { data, error } = await supabase
        .from("schema_cache")
        .select("cached_at, api_version")
        .eq("source_id", sourceId)
        .order("cached_at", { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (error) throw error;
      
      // Update the local status
      if (data) {
        setStatus(prev => ({
          ...prev,
          [sourceId]: {
            isCaching: false,
            lastCached: data.cached_at,
            error: null
          }
        }));
      }
      
      return data || null;
    } catch (error) {
      devLogger.error("SchemaCache", "Failed to check cache status", error);
      return null;
    }
  }, []);

  return {
    refreshSchema,
    checkCacheStatus,
    status
  };
}
