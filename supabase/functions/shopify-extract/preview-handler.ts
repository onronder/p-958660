
import { executeShopifyQuery } from "./shopify-api.ts";
import { extractResults } from "./extraction-utils.ts";

/**
 * Handles preview requests for Shopify queries 
 */
export async function handlePreviewRequest(requestData, supabase, corsHeaders) {
  try {
    const { user, source_id, custom_query, template_key, limit = 5 } = requestData;
    
    console.log("Processing preview request for source:", source_id);
    
    // Get source details
    const { data: source, error: sourceError } = await supabase
      .from("sources")
      .select("*")
      .eq("id", source_id)
      .eq("user_id", user.id)
      .single();
    
    if (sourceError || !source) {
      console.error("Source error:", sourceError);
      return new Response(
        JSON.stringify({ error: "Source not found or not authorized" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    // For Shopify sources, get the credentials
    if (source.source_type !== "Shopify") {
      return new Response(
        JSON.stringify({ error: "Only Shopify sources are supported currently" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    // Get Shopify credentials from the source
    if (!source.credentials || !source.credentials.credential_id) {
      console.error("Missing credential_id in source credentials:", source.credentials);
      return new Response(
        JSON.stringify({ error: "Source credentials are missing or invalid" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    // Get Shopify credentials
    const credentialId = source.credentials.credential_id;
    console.log("Fetching credentials with ID:", credentialId);
    
    const { data: shopifyCredentials, error: credentialsError } = await supabase
      .from("shopify_credentials")
      .select("*")
      .eq("id", credentialId)
      .single();
    
    if (credentialsError || !shopifyCredentials) {
      console.error("Credentials error:", credentialsError);
      return new Response(
        JSON.stringify({ error: "Shopify credentials not found" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    // Validate required credentials
    if (!shopifyCredentials.store_name || !shopifyCredentials.api_token) {
      console.error("Missing required Shopify credentials:", {
        hasStoreName: !!shopifyCredentials.store_name,
        hasApiToken: !!shopifyCredentials.api_token
      });
      
      return new Response(
        JSON.stringify({ error: "Incomplete Shopify credentials (missing store name or API token)" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    console.log("Executing GraphQL query to Shopify store:", shopifyCredentials.store_name);
    
    // Extract all available credentials
    const clientId = shopifyCredentials.client_id || shopifyCredentials.api_key;
    const clientSecret = shopifyCredentials.client_secret || shopifyCredentials.api_secret;
    const apiToken = shopifyCredentials.api_token || shopifyCredentials.access_token;
    
    // Log available credentials (safely, without exposing actual values)
    console.log("Using credentials:", {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasApiToken: !!apiToken,
      storeName: shopifyCredentials.store_name
    });
    
    // Execute the query directly
    const previewLimit = limit || 5; // Ensure we have a limit for preview
    const variables = { first: previewLimit };
    const apiVersion = "2023-10"; // Could be made configurable
    
    // Log query for debugging
    if (custom_query) {
      console.log("Custom GraphQL query:", custom_query);
    } else if (template_key) {
      console.log("Using template key:", template_key);
    }
    
    // Execute Shopify GraphQL query with all available credentials
    const result = await executeShopifyQuery({
      shopName: shopifyCredentials.store_name,
      apiToken,
      clientId,
      clientSecret,
      query: custom_query,
      variables,
      apiVersion
    });
    
    if (result.error) {
      console.error("Shopify API error:", result.status, result.error);
      return new Response(
        JSON.stringify({ 
          error: result.error,
          details: result.details
        }),
        { 
          status: result.status || 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    if (!result.data) {
      return new Response(
        JSON.stringify({ error: "No data returned from Shopify API" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    // Extract results
    const results = extractResults(result.data);
    console.log("Successfully extracted results:", results.length);
    
    // Generate a formatted sample for display
    const sample = results.length > 0 
      ? JSON.stringify(results.slice(0, Math.min(3, results.length)), null, 2)
      : null;
    
    return new Response(
      JSON.stringify({ 
        results,
        count: results.length,
        preview: true,
        sample
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("Preview error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred during preview" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
}
