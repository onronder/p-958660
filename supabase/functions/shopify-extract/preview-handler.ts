
import { executeShopifyQuery } from "./shopify-api.ts";
import { extractResults } from "./extraction-utils.ts";

/**
 * Handles preview requests for Shopify queries 
 */
export async function handlePreviewRequest({
  user,
  supabase,
  source_id,
  custom_query,
  limit,
  responseCorsHeaders
}) {
  try {
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
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // For Shopify sources, get the credentials
    if (source.source_type !== "Shopify") {
      return new Response(
        JSON.stringify({ error: "Only Shopify sources are supported currently" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
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
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
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
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
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
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    console.log("Executing GraphQL query to Shopify store:", shopifyCredentials.store_name);
    
    // Execute the query directly
    const variables = { first: limit };
    const apiVersion = "2023-10"; // Could be made configurable
    
    // Log query for debugging
    console.log("GraphQL query:", custom_query);
    
    // Execute Shopify GraphQL query
    const result = await executeShopifyQuery({
      shopName: shopifyCredentials.store_name,
      apiToken: shopifyCredentials.api_token,
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
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    if (!result.data) {
      return new Response(
        JSON.stringify({ error: "No data returned from Shopify API" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // Extract results
    const results = extractResults(result.data);
    console.log("Successfully extracted results:", results.length);
    
    return new Response(
      JSON.stringify({ 
        results,
        count: results.length,
        preview: true
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
      }
    );
  } catch (error) {
    console.error("Preview error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred during preview" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
      }
    );
  }
}
