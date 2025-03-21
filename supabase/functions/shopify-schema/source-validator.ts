
import { getProductionCorsHeaders } from "../_shared/cors.ts";

/**
 * Validates and extracts Shopify source details
 * @param sourceId Source ID to validate
 * @param supabase Supabase client instance
 * @returns Object containing validation result with credentials if successful
 */
export async function validateShopifySource(sourceId: string, supabase: any): Promise<{
  valid: boolean;
  error?: Response;
  storeUrl?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
}> {
  console.log("Validating source ID:", sourceId);
  
  // Get source details from database
  const { data: source, error: sourceError } = await supabase
    .from('sources')
    .select('*')
    .eq('id', sourceId)
    .single();
  
  if (sourceError || !source) {
    console.error("Error fetching source:", sourceError);
    const error = new Response(
      JSON.stringify({ error: "Source not found or could not be retrieved" }),
      { 
        status: 404, 
        headers: { 
          'Content-Type': 'application/json',
          ...getProductionCorsHeaders()
        } 
      }
    );
    return { valid: false, error };
  }

  console.log("Source retrieved:", source.name, "Type:", source.source_type);

  // Check if source is of type Shopify
  if (source.source_type !== 'Shopify') {
    const error = new Response(
      JSON.stringify({ error: "Source is not a Shopify store" }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...getProductionCorsHeaders()
        } 
      }
    );
    return { valid: false, error };
  }

  // Extract credentials
  const credentials = source.credentials || {};
  const clientId = credentials.client_id || credentials.api_key;
  const clientSecret = credentials.client_secret || credentials.api_secret;
  const accessToken = credentials.access_token;
  const storeUrl = source.url;
  
  // Log available credentials for debugging (without exposing sensitive values)
  console.log("Credentials check:", {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    hasAccessToken: !!accessToken,
    storeUrl: storeUrl
  });
  
  if (!storeUrl) {
    const error = new Response(
      JSON.stringify({ error: "Missing store URL in source configuration" }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...getProductionCorsHeaders()
        } 
      }
    );
    return { valid: false, error };
  }

  // We need at least an access token for API access
  if (!accessToken) {
    const error = new Response(
      JSON.stringify({ error: "Missing required Shopify access token" }),
      { 
        status: 400, 
        headers: { 
          'Content-Type': 'application/json',
          ...getProductionCorsHeaders()
        } 
      }
    );
    return { valid: false, error };
  }

  // Ensure store URL has proper format
  const formattedStoreUrl = storeUrl.includes(".myshopify.com") 
    ? storeUrl.replace(/^https?:\/\//, '') 
    : `${storeUrl}.myshopify.com`;
  
  return { 
    valid: true, 
    storeUrl: formattedStoreUrl, 
    clientId,
    clientSecret,
    accessToken 
  };
}
