
import { supabase } from "@/integrations/supabase/client";
import { Source, SourceStatus } from "@/types/source";

export const fetchUserSources = async (userId: string) => {
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    throw error;
  }
  
  return data?.map(source => {
    const status = validateSourceStatus(source.status);
    return {
      ...source,
      status
    } as Source;
  }) || [];
};

export const deleteSource = async (sourceId: string) => {
  const { error } = await supabase
    .from('sources')
    .delete()
    .eq('id', sourceId);
    
  if (error) {
    throw error;
  }
};

export const validateSourceStatus = (status: string): SourceStatus => {
  const validStatuses: SourceStatus[] = ["Active", "Inactive", "Pending", "Failed"];
  return validStatuses.includes(status as SourceStatus) 
    ? (status as SourceStatus) 
    : "Inactive"; // Default fallback
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  }).format(date);
};

export const testShopifyConnection = async (sourceId: string, storeUrl: string, credentials: any) => {
  try {
    if (credentials.api_token) {
      // For Shopify private API
      const { data, error } = await supabase.functions.invoke("shopify-private", {
        body: {
          action: "test_connection",
          store_url: storeUrl,
          api_key: credentials.api_key,
          api_token: credentials.api_token
        }
      });
      
      if (error || data.error) {
        throw new Error(error?.message || data.error || "Connection test failed");
      }
      
      // Update source connection status
      await updateSourceConnectionStatus(sourceId, true);
      return true;
    } else if (credentials.access_token) {
      // For Shopify OAuth (existing implementation)
      const { data, error } = await supabase.functions.invoke("shopify-oauth", {
        body: {
          pathname: "/shopify-oauth/test-connection",
          store_name: storeUrl,
          access_token: credentials.access_token
        }
      });
      
      if (error || !data.success) {
        throw new Error(error?.message || "Connection test failed");
      }
      
      // Update source connection status
      await updateSourceConnectionStatus(sourceId, true);
      return true;
    }
    
    throw new Error("Missing required credentials for testing");
  } catch (error) {
    console.error("Error testing connection:", error);
    // Update source connection status to failed
    await updateSourceConnectionStatus(sourceId, false);
    throw error;
  }
};

// Helper function to update source connection status
const updateSourceConnectionStatus = async (sourceId: string, status: boolean) => {
  try {
    // Get current source data
    const { data: sourceData, error: getError } = await supabase
      .from("sources")
      .select("credentials")
      .eq("id", sourceId)
      .single();
    
    if (getError) {
      console.error("Error fetching source:", getError);
      return;
    }
    
    // Update credentials with connection status
    const credentials = sourceData.credentials || {};
    const updatedCredentials = {
      ...credentials,
      last_connection_status: status,
      last_connection_time: new Date().toISOString()
    };
    
    // Update source
    const { error: updateError } = await supabase
      .from("sources")
      .update({
        credentials: updatedCredentials,
        status: status ? "Active" : "Failed",
        updated_at: new Date().toISOString()
      })
      .eq("id", sourceId);
    
    if (updateError) {
      console.error("Error updating source connection status:", updateError);
    }
  } catch (error) {
    console.error("Error updating source connection status:", error);
  }
};
