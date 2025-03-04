
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

  // Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  try {
    const { pathname } = new URL(req.url);
    
    // Handle different endpoints
    if (pathname === "/shopify-oauth/authenticate") {
      const { store_name } = await req.json();
      
      if (!store_name) {
        return new Response(
          JSON.stringify({ error: "Store name is required" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      // Generate OAuth URL
      const authUrl = `https://${store_name}/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=read_orders,read_products,read_customers&redirect_uri=${FLOWTECHS_REDIRECT_URI}`;
      
      return new Response(
        JSON.stringify({ auth_url: authUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    else if (pathname === "/shopify-oauth/callback") {
      const url = new URL(req.url);
      const code = url.searchParams.get('code');
      const shop = url.searchParams.get('shop');
      
      if (!code || !shop) {
        return new Response(
          JSON.stringify({ error: "Missing code or shop parameter" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      // Exchange code for access token
      const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_id: SHOPIFY_CLIENT_ID,
          client_secret: SHOPIFY_CLIENT_SECRET,
          code: code
        })
      });
      
      const tokenData = await tokenResponse.json();
      
      if (!tokenData.access_token) {
        return new Response(
          JSON.stringify({ error: "Failed to obtain access token" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      // Save token in the response to be handled by frontend
      return new Response(
        JSON.stringify({ 
          access_token: tokenData.access_token,
          shop: shop,
          scope: tokenData.scope
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    else if (pathname === "/shopify-oauth/save-token") {
      const { user_id, store_name, access_token, source_name } = await req.json();
      
      if (!user_id || !store_name || !access_token) {
        return new Response(
          JSON.stringify({ error: "Missing required parameters" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
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
          JSON.stringify({ error: "Failed to save connection" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true, source_id: data[0].id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    else if (pathname === "/shopify-oauth/test-connection") {
      const { store_name, access_token } = await req.json();
      
      if (!store_name || !access_token) {
        return new Response(
          JSON.stringify({ error: "Missing store name or access token" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      // Test the connection by making a simple API call to Shopify
      const testResponse = await fetch(`https://${store_name}/admin/api/2024-01/shop.json`, {
        headers: { 'X-Shopify-Access-Token': access_token }
      });
      
      if (!testResponse.ok) {
        return new Response(
          JSON.stringify({ error: "Connection test failed", status: testResponse.status }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
    );
  } 
  catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
