
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
  const SHOPIFY_CLIENT_ID = Deno.env.get('SHOPIFY_CLIENT_ID');
  const SHOPIFY_CLIENT_SECRET = Deno.env.get('SHOPIFY_CLIENT_SECRET');
  const FLOWTECHS_REDIRECT_URI = Deno.env.get('FLOWTECHS_REDIRECT_URI');

  // Log all environment variables availability (not the values for security)
  console.log("Environment variables check:", {
    "SUPABASE_URL": Boolean(SUPABASE_URL),
    "SUPABASE_ANON_KEY": Boolean(SUPABASE_ANON_KEY),
    "SHOPIFY_CLIENT_ID": Boolean(SHOPIFY_CLIENT_ID),
    "SHOPIFY_CLIENT_SECRET": Boolean(SHOPIFY_CLIENT_SECRET),
    "FLOWTECHS_REDIRECT_URI": Boolean(FLOWTECHS_REDIRECT_URI)
  });

  if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET || !FLOWTECHS_REDIRECT_URI) {
    console.error("Missing required environment variables");
    return new Response(
      JSON.stringify({ error: "Server configuration issue - missing required environment variables" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }

  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    // Get the request URL and determine the requested action
    const { pathname } = new URL(req.url);
    console.log("Request to endpoint:", pathname);

    // Check if this is a direct URL call (callback) or an action from the frontend
    if (pathname.includes("/callback")) {
      // Handle the OAuth callback
      const url = new URL(req.url);
      const code = url.searchParams.get('code');
      const shop = url.searchParams.get('shop');
      
      console.log("Callback received with shop:", shop);
      
      if (!code || !shop) {
        console.error("Missing code or shop parameter");
        return new Response(
          JSON.stringify({ error: "Missing code or shop parameter" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      // Exchange code for access token
      console.log("Exchanging code for access token...");
      const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: SHOPIFY_CLIENT_ID,
          client_secret: SHOPIFY_CLIENT_SECRET,
          code: code
        })
      });
      
      const tokenStatus = tokenResponse.status;
      console.log("Token exchange status:", tokenStatus);
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok || !tokenData.access_token) {
        console.error("Failed to obtain access token, status:", tokenStatus);
        return new Response(
          JSON.stringify({ 
            error: "Failed to obtain access token", 
            status: tokenStatus,
            details: tokenData
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      console.log("Successfully obtained access token");
      
      // Save token in the response to be handled by frontend
      return new Response(
        JSON.stringify({ 
          access_token: tokenData.access_token,
          shop: shop,
          scope: tokenData.scope
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Handle action-based requests from the frontend
      const requestData = await req.json();
      const { action, store_name, user_id, access_token, source_name } = requestData;
      
      console.log("Received action:", action);
      
      if (action === "authenticate") {
        // Generate OAuth URL for authentication
        if (!store_name) {
          console.error("Missing store_name parameter");
          return new Response(
            JSON.stringify({ error: "Store name is required" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
        
        console.log("Generating auth URL for store:", store_name);
        
        // Generate OAuth URL
        const authUrl = `https://${store_name}/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=read_orders,read_products,read_customers&redirect_uri=${FLOWTECHS_REDIRECT_URI}`;
        console.log("Generated auth URL (domain only for security):", new URL(authUrl).origin);
        
        return new Response(
          JSON.stringify({ auth_url: authUrl }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else if (action === "save_token") {
        // Save token to database
        if (!user_id || !store_name || !access_token) {
          console.error("Missing required parameters for saving token");
          return new Response(
            JSON.stringify({ error: "Missing required parameters" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
        
        console.log("Saving connection to database for store:", store_name);
        
        // Save the connection details to the database
        const { data, error } = await supabase
          .from('sources')
          .insert({
            user_id: user_id,
            name: source_name || `Shopify - ${store_name}`,
            url: store_name,
            source_type: 'Shopify',
            status: 'Active',
            credentials: { access_token }
          })
          .select('id');
        
        if (error) {
          console.error("Error saving token:", error);
          return new Response(
            JSON.stringify({ error: "Failed to save connection", details: error }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }
        
        console.log("Successfully saved connection with ID:", data[0].id);
        
        return new Response(
          JSON.stringify({ success: true, source_id: data[0].id }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } else if (action === "test_connection") {
        // Test connection to Shopify
        if (!store_name || !access_token) {
          console.error("Missing store name or access token for testing");
          return new Response(
            JSON.stringify({ error: "Missing store name or access token" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
        
        console.log("Testing connection to Shopify API for store:", store_name);
        
        // Test the connection by making a simple API call to Shopify
        const testResponse = await fetch(`https://${store_name}/admin/api/2024-01/shop.json`, {
          headers: { 'X-Shopify-Access-Token': access_token }
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
        
        console.log("Connection test successful");
        
        return new Response(
          JSON.stringify({ success: true }),
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
  } 
  catch (error) {
    console.error("Error in edge function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error", stack: error.stack }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
