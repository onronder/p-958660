
import { useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { devLogger } from "@/utils/DevLogger";

interface SchemaCacheStatus {
  isCaching: boolean;
  lastCached: string | null;
  error: string | null;
}

export function useSchemaCache() {
  const [status, setStatus] = useState<Record<string, SchemaCacheStatus>>({});
  const { user } = useAuth();

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
      
      // Call the edge function to fetch and cache the schema
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/shopify-schema`, {
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to refresh schema");
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Unknown error refreshing schema");
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
        description: data.message || "GraphQL schema successfully updated",
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
        .select("cached_at")
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
      
      return data?.cached_at || null;
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
