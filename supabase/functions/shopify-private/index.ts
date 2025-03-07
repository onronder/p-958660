
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get environment variables
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Missing required environment variables");
    return new Response(
      JSON.stringify({ error: "Server configuration issue - missing required environment variables" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    const requestData = await req.json();
    const { action, store_url, api_key, api_token } = requestData;
    
    console.log("Received action:", action);
    
    if (action === "test_connection") {
      // Test Shopify connection using provided credentials
      if (!store_url || !api_token) {
        console.error("Missing store_url or api_token parameters");
        return new Response(
          JSON.stringify({ error: "Store URL and API token are required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      console.log("Testing connection to Shopify API for store:", store_url);
      
      // Format the store URL if needed
      const formattedStoreUrl = store_url.includes(".myshopify.com") 
        ? store_url 
        : `${store_url}.myshopify.com`;
      
      // Test the connection by making a simple API call to Shopify
      const shopifyUrl = `https://${formattedStoreUrl}/admin/api/2025-01/shop.json`;
      console.log("Making request to:", shopifyUrl);
      
      const testResponse = await fetch(shopifyUrl, {
        headers: { 
          'X-Shopify-Access-Token': api_token,
          'Content-Type': 'application/json'
        }
      });
      
      const testStatus = testResponse.status;
      console.log("Test connection status:", testStatus);
      
      if (!testResponse.ok) {
        console.error("Connection test failed with status:", testStatus);
        let errorJson;
        try {
          errorJson = await testResponse.json();
        } catch (e) {
          errorJson = { message: "Could not parse error response" };
        }
        
        return new Response(
          JSON.stringify({ 
            error: "Connection test failed", 
            status: testStatus,
            details: errorJson
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      const shopData = await testResponse.json();
      console.log("Connection test successful, shop data retrieved");
      
      return new Response(
        JSON.stringify({ 
          success: true,
          shop: shopData.shop
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.error("Unknown action requested:", action);
      return new Response(
        JSON.stringify({ error: "Unknown action" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
  } 
  catch (error) {
    console.error("Error in edge function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error", stack: error.stack }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
