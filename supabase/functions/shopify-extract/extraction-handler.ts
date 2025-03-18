
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { executeShopifyQuery } from "./shopify-api.ts";
import { extractResults } from "./extraction-utils.ts";
import { getPredefinedQuery, getDependentQueryTemplate } from "./query-templates.ts";

/**
 * Handles the main extraction process
 */
export async function handleExtraction({
  user,
  supabase,
  extraction_id,
  preview_only = false,
  limit = 250,
  responseCorsHeaders
}) {
  try {
    // Get extraction details
    const { data: extraction, error: extractionError } = await supabase
      .from("extractions")
      .select("*")
      .eq("id", extraction_id)
      .eq("user_id", user.id)
      .single();
    
    if (extractionError || !extraction) {
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
    const { data: shopifyCredentials, error: credentialsError } = await supabase
      .from("shopify_credentials")
      .select("*")
      .eq("id", credentialId)
      .eq("user_id", user.id)
      .single();
    
    if (credentialsError || !shopifyCredentials) {
      return new Response(
        JSON.stringify({ error: "Shopify credentials not found" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // Update extraction status to running if not just a preview
    if (!preview_only) {
      await supabase
        .from("extractions")
        .update({ 
          status: "running", 
          started_at: new Date().toISOString(),
          progress: 0,
          status_message: "Starting extraction..."
        })
        .eq("id", extraction_id);
    }
    
    let query = "";
    let variables = { first: limit };
    
    // Determine which query to use based on extraction type
    switch (extraction.extraction_type) {
      case "custom":
        query = extraction.custom_query || "";
        break;
      case "predefined":
        query = getPredefinedQuery(extraction.template_name);
        break;
      case "dependent":
        // For dependent queries, we'll need to implement more complex logic
        // This is a placeholder for future implementation
        query = getDependentQueryTemplate(extraction.template_name).primaryQuery;
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid extraction type" }),
          { 
            status: 400, 
            headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
          }
        );
    }
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Failed to generate query" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
          }
      );
    }
    
    // Execute the query
    const apiVersion = "2023-10"; // Could be made configurable
    
    // Execute Shopify GraphQL query
    const result = await executeShopifyQuery({
      shopName: shopifyCredentials.store_name,
      apiToken: shopifyCredentials.api_token,
      query,
      variables,
      apiVersion
    });
    
    if (result.error) {
      // Update extraction status if not a preview
      if (!preview_only) {
        await supabase
          .from("extractions")
          .update({ 
            status: "failed", 
            status_message: `Shopify API error: ${result.error}`,
            completed_at: new Date().toISOString()
          })
          .eq("id", extraction_id);
      }
      
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
    
    // Extract results based on query type
    const results = extractResults(result.data);
    
    // For preview only, just return the results
    if (preview_only) {
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
    }
    
    // Update extraction with results
    await supabase
      .from("extractions")
      .update({ 
        status: "completed", 
        progress: 100,
        status_message: "Extraction completed successfully",
        result_data: results,
        record_count: results.length,
        completed_at: new Date().toISOString()
      })
      .eq("id", extraction_id);
    
    return new Response(
      JSON.stringify({ 
        results,
        count: results.length,
        extraction_id
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
      }
    );
  } catch (error) {
    console.error("Extraction error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
      }
    );
  }
}
