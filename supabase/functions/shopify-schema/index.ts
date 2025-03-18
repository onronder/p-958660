
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";
import { validateShopifySource } from "./source-validator.ts";
import { detectShopifyApiVersion, testShopifyConnection } from "./version-detection.ts";
import { fetchShopifySchema } from "./schema-fetcher.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log("Processing request for source_id:", source_id, "test_only:", test_only, "force_refresh:", force_refresh);

    // Validate the Shopify source
    const sourceValidation = await validateShopifySource(source_id, supabase);
    if (!sourceValidation.valid) {
      return sourceValidation.error;
    }

    const { storeUrl, accessToken } = sourceValidation;

    // Detect the current Shopify API version
    const apiVersion = await detectShopifyApiVersion(storeUrl, accessToken);

    // For test_only, we just verify if we can connect to Shopify's GraphQL API
    if (test_only) {
      return await testShopifyConnection(storeUrl, accessToken, apiVersion);
    }
    
    // Fetch and cache the schema
    return await fetchShopifySchema(storeUrl, accessToken, apiVersion, source_id, supabase);
    
  } catch (error) {
    console.error("Unexpected error in shopify-schema function:", error);
    
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
