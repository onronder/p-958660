
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    // Get origin for CORS
    const origin = req.headers.get('origin');
    
    // For ping test to check if the function is alive
    const requestUrl = new URL(req.url);
    if (requestUrl.searchParams.get('ping') === 'true') {
      console.log("Ping test received");
      return new Response(
        JSON.stringify({ 
          status: "ok", 
          message: "test-shopify-graphql function is operational" 
        }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }

    // Create Supabase client using the service role key (needed to access source credentials)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request
    const { source_id, query } = await req.json();
    
    if (!source_id) {
      console.error("Missing source_id in request");
      return new Response(
        JSON.stringify({ error: "Source ID is required" }),
        { 
          status: 400, 
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    if (!query) {
      console.error("Missing query in request");
      return new Response(
        JSON.stringify({ error: "GraphQL query is required" }),
        { 
          status: 400, 
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
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
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch source details: ${sourceError?.message || "Source not found"}` 
        }),
        { 
          status: 404, 
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    if (source.source_type !== 'Shopify') {
      console.error(`Invalid source type: ${source.source_type}, expected Shopify`);
      return new Response(
        JSON.stringify({ error: "Source must be a Shopify source" }),
        { 
          status: 400, 
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    // Extract credentials
    const credentials = source.credentials || {};
    const shopName = source.url;
    const clientId = credentials.client_id;
    const clientSecret = credentials.client_secret;
    const apiToken = credentials.access_token;
    
    if (!shopName) {
      console.error("Missing shop_name in source credentials");
      return new Response(
        JSON.stringify({ error: "Shop name is missing in source credentials" }),
        { 
          status: 400, 
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    if (!clientId) {
      console.error("Missing client_id in source credentials");
      return new Response(
        JSON.stringify({ error: "Client ID is missing in source credentials" }),
        { 
          status: 400, 
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    if (!clientSecret) {
      console.error("Missing client_secret in source credentials");
      return new Response(
        JSON.stringify({ error: "Client Secret is missing in source credentials" }),
        { 
          status: 400, 
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    if (!apiToken) {
      console.error("Missing API token in source credentials");
      return new Response(
        JSON.stringify({ error: "API token is missing in source credentials" }),
        { 
          status: 400, 
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
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
        'X-Shopify-Access-Token': apiToken,
        'X-Shopify-Client-Id': clientId,
        'X-Shopify-Client-Secret': clientSecret
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
      
      return new Response(
        JSON.stringify({
          error: 'Shopify API request failed',
          details: errorDetails,
          status: shopifyResponse.status
        }),
        { 
          status: shopifyResponse.status, 
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    const responseData = await shopifyResponse.json();
    
    // Handle GraphQL errors
    if (responseData.errors) {
      console.error('Shopify GraphQL errors:', responseData.errors);
      return new Response(
        JSON.stringify({
          error: 'GraphQL query execution failed',
          errors: responseData.errors
        }),
        { 
          status: 400, 
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        }
      );
    }
    
    // Return success response
    return new Response(
      JSON.stringify({
        data: responseData,
        meta: {
          source_id: source_id,
          shop_name: formattedShopName
        }
      }),
      { 
        status: 200, 
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error('Exception in test-shopify-graphql:', error);
    return new Response(
      JSON.stringify({
        error: `Failed to execute Shopify GraphQL query: ${error.message}`,
        stack: error.stack
      }),
      { 
        status: 500, 
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});
