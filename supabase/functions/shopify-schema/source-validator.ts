
import { corsHeaders } from "../_shared/cors.ts";

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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    return { valid: false, error };
  }

  // Extract credentials
  const credentials = source.credentials || {};
  const accessToken = credentials.api_token || credentials.access_token;
  const storeUrl = source.url;
  
  if (!storeUrl || !accessToken) {
    const error = new Response(
      JSON.stringify({ error: "Missing Shopify store URL or access token" }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    return { valid: false, error };
  }

  // Ensure store URL has proper format
  const formattedStoreUrl = storeUrl.includes(".myshopify.com") 
    ? storeUrl.replace(/^https?:\/\//, '') 
    : `${storeUrl}.myshopify.com`;
  
  return { valid: true, storeUrl: formattedStoreUrl, accessToken };
}
