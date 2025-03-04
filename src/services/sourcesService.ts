
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
    // For Shopify, use the edge function to test the connection
    if (credentials.access_token) {
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
      
      return true;
    }
    
    throw new Error("Missing required credentials for testing");
  } catch (error) {
    console.error("Error testing connection:", error);
    throw error;
  }
};
