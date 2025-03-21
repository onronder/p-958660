
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { getProductionCorsHeaders } from '../_shared/cors.ts';
import { validateShopifySource } from "./source-validator.ts";
import { detectShopifyApiVersion, testShopifyConnection } from "./version-detection.ts";
import { fetchShopifySchema } from "./schema-fetcher.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getProductionCorsHeaders(req.headers.get('origin'))
    });
  }

  try {
    // Get Supabase URLs and keys from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { source_id, test_only = false, force_refresh = false } = await req.json();
    
    if (!source_id) {
      return new Response(
        JSON.stringify({ error: "Source ID is required" }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...getProductionCorsHeaders(req.headers.get('origin'))
          } 
        }
      );
    }

    console.log("Processing request for source_id:", source_id, "test_only:", test_only, "force_refresh:", force_refresh);

    // Validate the Shopify source and get credentials
    const sourceValidation = await validateShopifySource(source_id, supabase);
    if (!sourceValidation.valid) {
      return sourceValidation.error;
    }

    // Extract all required credentials
    const { 
      storeUrl, 
      accessToken, 
      clientId, 
      clientSecret 
    } = sourceValidation;

    // Detect the current Shopify API version
    const apiVersion = await detectShopifyApiVersion(storeUrl, accessToken);

    // For test_only, we just verify if we can connect to Shopify's GraphQL API
    if (test_only) {
      return await testShopifyConnection(storeUrl, accessToken, apiVersion, clientId, clientSecret);
    }
    
    // Fetch and cache the schema
    return await fetchShopifySchema(storeUrl, accessToken, apiVersion, source_id, supabase, force_refresh);
    
  } catch (error) {
    console.error("Unexpected error in shopify-schema function:", error);
    
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...getProductionCorsHeaders(req.headers.get('origin'))
        } 
      }
    );
  }
});
