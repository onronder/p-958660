
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    const { action, store_url, api_key, api_token, user_id } = requestData;
    
    console.log("Received action:", action);
    
    if (action === "test_connection") {
      // Test Shopify connection using provided credentials
      if (!store_url || !api_token) {
        console.error("Missing store_url or api_token parameters");
        return new Response(
          JSON.stringify({ 
            error: "Store URL and API token are required",
            errorType: "missing_parameters"
          }),
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
      
      try {
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
          let errorJson = {};
          
          try {
            errorJson = await testResponse.json();
          } catch (e) {
            console.error("Could not parse error response:", e);
            errorJson = { message: "Could not parse error response" };
          }

          let errorMessage = "Connection test failed";
          let errorType = "unknown_error";
          
          // Provide more specific error messages based on status code
          if (testStatus === 401) {
            errorMessage = "Authentication failed. Please check your API token.";
            errorType = "auth_error";
          } else if (testStatus === 404) {
            errorMessage = "Store not found. Please check your store URL.";
            errorType = "store_not_found";
          } else if (testStatus === 403) {
            errorMessage = "Access forbidden. Your API token may not have sufficient permissions.";
            errorType = "permission_error";
          } else if (testStatus >= 500) {
            errorMessage = "Shopify server error. Please try again later.";
            errorType = "server_error";
          }

          // Log the error if user_id is provided
          if (user_id) {
            try {
              const { data: supabaseProjectId } = await fetch(
                Deno.env.get("SUPABASE_URL") + "/rest/v1/shopify_logs",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                    "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
                  },
                  body: JSON.stringify({
                    store_name: formattedStoreUrl,
                    api_key: api_key ? api_key.substring(0, 4) + "..." : null, // Only store partial key for security
                    error_message: errorMessage,
                    error_details: errorJson,
                    http_status: testStatus,
                    user_id
                  }),
                }
              ).json();
              
              console.log("Error logged to shopify_logs table");
            } catch (logError) {
              console.error("Failed to log error to database:", logError);
            }
          }
          
          return new Response(
            JSON.stringify({ 
              error: errorMessage, 
              errorType,
              status: testStatus,
              details: errorJson
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
        
        const shopData = await testResponse.json();
        console.log("Connection test successful, shop data retrieved:", {
          name: shopData.shop?.name,
          hasData: Boolean(shopData.shop)
        });
        
        return new Response(
          JSON.stringify({ 
            success: true,
            shop: shopData.shop
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (fetchError) {
        console.error("Fetch error during test:", fetchError);
        
        const errorMessage = "Failed to connect to Shopify";
        const errorDetails = { message: fetchError.message };
        
        // Log the error if user_id is provided
        if (user_id) {
          try {
            await fetch(
              Deno.env.get("SUPABASE_URL") + "/rest/v1/shopify_logs",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
                  "apikey": Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
                },
                body: JSON.stringify({
                  store_name: formattedStoreUrl,
                  api_key: api_key ? api_key.substring(0, 4) + "..." : null,
                  error_message: errorMessage,
                  error_details: errorDetails,
                  http_status: null,
                  user_id
                }),
              }
            );
            
            console.log("Network error logged to shopify_logs table");
          } catch (logError) {
            console.error("Failed to log error to database:", logError);
          }
        }
        
        return new Response(
          JSON.stringify({ 
            error: errorMessage, 
            errorType: "network_error",
            details: errorDetails
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }
    } else {
      console.error("Unknown action requested:", action);
      return new Response(
        JSON.stringify({ error: "Unknown action", errorType: "invalid_action" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
  } 
  catch (error) {
    console.error("Error in edge function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error", 
        errorType: "server_error",
        stack: error.stack 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
