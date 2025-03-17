
import { executeShopifyQuery } from "../shopify-extract/shopify-api.ts";
import { extractResults } from "../shopify-extract/extraction-utils.ts";
import { getDependentQueryTemplate } from "./dependent-query-templates.ts";

/**
 * Handles preview requests for dependent Shopify queries
 */
export async function handlePreviewRequest({
  user,
  supabase,
  extraction_id,
  responseCorsHeaders
}) {
  try {
    console.log("Processing preview request for extraction:", extraction_id);
    
    // Get extraction details
    const { data: extraction, error: extractionError } = await supabase
      .from("extractions")
      .select("*")
      .eq("id", extraction_id)
      .eq("user_id", user.id)
      .single();
    
    if (extractionError || !extraction) {
      console.error("Extraction error:", extractionError);
      return new Response(
        JSON.stringify({ error: "Extraction not found or not authorized" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // Get source details
    const { data: source, error: sourceError } = await supabase
      .from("sources")
      .select("*")
      .eq("id", extraction.source_id)
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
    
    // Get Shopify credentials
    const credentialId = source.credentials.credential_id;
    console.log("Fetching credentials with ID:", credentialId);
    
    const { data: shopifyCredentials, error: credentialsError } = await supabase
      .from("shopify_credentials")
      .select("*")
      .eq("id", credentialId)
      .eq("user_id", user.id)
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
    
    // Get the dependent query template
    const template = getDependentQueryTemplate(extraction.template_name);
    if (!template || !template.primaryQuery) {
      return new Response(
        JSON.stringify({ error: "Invalid template or template not found" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // For preview, we'll just run a limited version of the primary query
    const apiVersion = "2023-10"; // Could be made configurable
    const variables = { first: 3 }; // Limit to 3 for preview
    
    // Execute Shopify GraphQL query
    const result = await executeShopifyQuery({
      shopName: shopifyCredentials.store_name,
      apiToken: shopifyCredentials.api_token,
      query: template.primaryQuery,
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
    
    // Extract primary results
    const results = extractResults(result.data);
    
    return new Response(
      JSON.stringify({ 
        results,
        count: results.length,
        preview: true,
        note: "This is a preview. The full extraction will include dependent data."
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
