
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { createErrorResponse, createSuccessResponse } from "../shopify-extract/response-utils.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
function handleCorsPreflightRequest(origin: string | null) {
  const headers = { ...corsHeaders };
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return new Response(null, {
    status: 204,
    headers,
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req.headers.get('origin'));
  }

  try {
    // Get origin for CORS
    const origin = req.headers.get('origin');
    
    // For ping test to check if the function is alive
    const requestUrl = new URL(req.url);
    if (requestUrl.searchParams.get('ping') === 'true') {
      console.log("Ping test received");
      return createSuccessResponse({ 
        status: "ok", 
        message: "test-shopify-graphql function is operational" 
      }, origin);
    }

    // Create Supabase client using the service role key (needed to access source credentials)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request
    const { source_id, query } = await req.json();
    
    if (!source_id) {
      console.error("Missing source_id in request");
      return createErrorResponse("Source ID is required", 400, origin);
    }
    
    if (!query) {
      console.error("Missing query in request");
      return createErrorResponse("GraphQL query is required", 400, origin);
    }
    
    console.log(`Processing test query for source: ${source_id}`);
    console.log(`Query length: ${query.length} characters`);

    // Get the source details including credentials
    const { data: source, error: sourceError } = await supabase
      .from('sources')
      .select('*')
      .eq('id', source_id)
      .single();
    
    if (sourceError || !source) {
      console.error("Error fetching source:", sourceError);
      return createErrorResponse(
        `Failed to fetch source details: ${sourceError?.message || "Source not found"}`, 
        404, 
        origin
      );
    }
    
    if (source.source_type !== 'Shopify') {
      console.error(`Invalid source type: ${source.source_type}, expected Shopify`);
      return createErrorResponse("Source must be a Shopify source", 400, origin);
    }
    
    // Extract credentials
    const credentials = source.credentials || {};
    const shopName = credentials.store_url;
    const apiToken = credentials.access_token || credentials.admin_api_token;
    
    if (!shopName) {
      console.error("Missing shop_name in source credentials");
      return createErrorResponse("Shop name is missing in source credentials", 400, origin);
    }
    
    if (!apiToken) {
      console.error("Missing API token in source credentials");
      return createErrorResponse("API token is missing in source credentials", 400, origin);
    }
    
    // Ensure shop name is properly formatted
    const formattedShopName = shopName.includes('.myshopify.com') 
      ? shopName 
      : `${shopName}.myshopify.com`;
      
    const apiVersion = '2023-10'; // Could be made configurable if needed
    const shopifyUrl = `https://${formattedShopName}/admin/api/${apiVersion}/graphql.json`;
    
    console.log(`Executing Shopify GraphQL query to: ${shopifyUrl}`);
    
    // Make the request to Shopify GraphQL API
    const shopifyResponse = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': apiToken
      },
      body: JSON.stringify({ query })
    });
    
    console.log(`Shopify API response status: ${shopifyResponse.status}`);
    
    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text();
      console.error('Shopify API error response:', errorText);
      
      let errorDetails;
      try {
        // Try to parse as JSON
        errorDetails = JSON.parse(errorText);
      } catch (e) {
        // If not JSON, return the raw text
        errorDetails = errorText;
      }
      
      return createErrorResponse({
        message: 'Shopify API request failed',
        details: errorDetails,
        status: shopifyResponse.status
      }, shopifyResponse.status, origin);
    }
    
    const responseData = await shopifyResponse.json();
    
    // Handle GraphQL errors
    if (responseData.errors) {
      console.error('Shopify GraphQL errors:', responseData.errors);
      return createErrorResponse({
        message: 'GraphQL query execution failed',
        errors: responseData.errors
      }, 400, origin);
    }
    
    // Return success response
    return createSuccessResponse({
      data: responseData,
      meta: {
        source_id: source_id,
        shop_name: formattedShopName
      }
    }, origin);
  } catch (error) {
    console.error('Exception in test-shopify-graphql:', error);
    return createErrorResponse({
      message: `Failed to execute Shopify GraphQL query: ${error.message}`,
      stack: error.stack
    }, 500, req.headers.get('origin'));
  }
});
