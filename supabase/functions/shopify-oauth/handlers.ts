
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { corsHeaders, createErrorResponse, createSuccessResponse } from "./utils.ts";

// Handle OAuth callback from Shopify
export async function handleOAuthCallback(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const shop = url.searchParams.get('shop');
  
  console.log("Callback received with shop:", shop);
  
  if (!code || !shop) {
    return createErrorResponse("Missing code or shop parameter");
  }
  
  const SHOPIFY_CLIENT_ID = Deno.env.get('SHOPIFY_CLIENT_ID');
  const SHOPIFY_CLIENT_SECRET = Deno.env.get('SHOPIFY_CLIENT_SECRET');
  
  // Exchange code for access token
  console.log("Exchanging code for access token...");
  try {
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
      return createErrorResponse(
        "Failed to obtain access token", 
        400, 
        { status: tokenStatus, details: tokenData }
      );
    }
    
    console.log("Successfully obtained access token");
    
    // Return token data to be handled by frontend
    return createSuccessResponse({ 
      access_token: tokenData.access_token,
      shop: shop,
      scope: tokenData.scope
    });
  } catch (error) {
    return createErrorResponse(
      "Error exchanging code for token", 
      500, 
      error
    );
  }
}

// Generate OAuth URL for authentication
export function generateAuthUrl(store_name: string) {
  if (!store_name) {
    return createErrorResponse("Store name is required");
  }
  
  console.log("Generating auth URL for store:", store_name);
  
  const SHOPIFY_CLIENT_ID = Deno.env.get('SHOPIFY_CLIENT_ID');
  const FLOWTECHS_REDIRECT_URI = Deno.env.get('FLOWTECHS_REDIRECT_URI');
  
  // Generate OAuth URL
  const authUrl = `https://${store_name}/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=read_orders,read_products,read_customers&redirect_uri=${FLOWTECHS_REDIRECT_URI}`;
  console.log("Generated auth URL (domain only for security):", new URL(authUrl).origin);
  
  return createSuccessResponse({ auth_url: authUrl });
}

// Save Shopify token to database
export async function saveToken(user_id: string, store_name: string, access_token: string, source_name: string | null) {
  if (!user_id || !store_name || !access_token) {
    return createErrorResponse("Missing required parameters");
  }
  
  console.log("Saving connection to database for store:", store_name);
  
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
  
  // Create Supabase client
  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  
  try {
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
      return createErrorResponse("Failed to save connection", 500, error);
    }
    
    console.log("Successfully saved connection with ID:", data[0].id);
    
    return createSuccessResponse({ success: true, source_id: data[0].id });
  } catch (error) {
    console.error("Error in saveToken:", error);
    return createErrorResponse("Error saving token", 500, error);
  }
}

// Test connection to Shopify
export async function testConnection(store_name: string, access_token: string) {
  if (!store_name || !access_token) {
    return createErrorResponse("Missing store name or access token");
  }
  
  console.log("Testing connection to Shopify API for store:", store_name);
  
  try {
    // Test the connection by making a simple API call to Shopify
    const testResponse = await fetch(`https://${store_name}/admin/api/2024-01/shop.json`, {
      headers: { 'X-Shopify-Access-Token': access_token }
    });
    
    const testStatus = testResponse.status;
    console.log("Test connection status:", testStatus);
    
    if (!testResponse.ok) {
      let errorJson;
      try {
        errorJson = await testResponse.json();
      } catch (e) {
        errorJson = { message: "Could not parse error response" };
      }
      
      return createErrorResponse(
        "Connection test failed", 
        400, 
        { status: testStatus, details: errorJson }
      );
    }
    
    console.log("Connection test successful");
    
    return createSuccessResponse({ success: true });
  } catch (error) {
    return createErrorResponse("Error testing connection", 500, error);
  }
}
