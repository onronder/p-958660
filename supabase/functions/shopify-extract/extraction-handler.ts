
import { createErrorResponse, createSuccessResponse } from "./response-utils.ts";
import { getShopifyCredentials } from "./services/credentials-service.ts";
import { prepareQuery } from "./services/query-service.ts";
import { executeExtraction } from "./services/extraction-service.ts";

/**
 * Handles extraction requests for Shopify queries 
 */
export async function handleExtractionRequest(requestData, supabase, corsHeaders) {
  const extractionStartTime = Date.now();
  
  try {
    const { 
      user, 
      extraction_id, 
      source_id, 
      custom_query, 
      template_key,
      preview_only = false, 
      limit = 250 
    } = requestData;
    
    console.log(`Processing ${preview_only ? 'preview' : 'full'} extraction request for source:`, source_id);
    console.log("Extraction parameters:", { 
      hasCustomQuery: !!custom_query, 
      hasTemplateKey: !!template_key,
      limit,
      extractionId: extraction_id
    });
    
    // Get source details
    const { data: source, error: sourceError } = await supabase
      .from("sources")
      .select("*")
      .eq("id", source_id)
      .eq("user_id", user.id)
      .single();
    
    if (sourceError || !source) {
      console.error("Source error:", sourceError);
      return createErrorResponse({
        message: "Source not found or not authorized", 
        details: sourceError
      }, 404, null, 'source_not_found');
    }
    
    // Get and validate Shopify credentials
    const credentialsResult = await getShopifyCredentials(source, supabase);
    if (!credentialsResult.success) {
      return createErrorResponse(
        credentialsResult.error,
        credentialsResult.status,
        null,
        credentialsResult.code
      );
    }
    
    // Prepare the GraphQL query
    const queryResult = await prepareQuery({
      custom_query,
      template_key,
      limit: preview_only ? Math.min(limit, 10) : limit
    });
    
    if (!queryResult.success) {
      return createErrorResponse(
        queryResult.error,
        queryResult.status,
        null,
        queryResult.code
      );
    }
    
    // Execute the extraction
    const extractionResult = await executeExtraction({
      credentials: credentialsResult.credentials,
      query: queryResult.query,
      variables: queryResult.variables,
      extractionId: extraction_id,
      userId: user.id,
      sourceId: source_id,
      previewOnly: preview_only,
      supabase,
      startTime: extractionStartTime,
      timeout: preview_only ? 15000 : 30000
    });
    
    if (!extractionResult.success) {
      return createErrorResponse(
        extractionResult.error,
        extractionResult.status,
        null,
        extractionResult.code
      );
    }
    
    // Return the extraction results
    return createSuccessResponse({ 
      results: extractionResult.results,
      count: extractionResult.count,
      extraction_id,
      preview: preview_only,
      sample: extractionResult.sample
    }, null);
    
  } catch (error) {
    console.error("Extraction handler error:", error);
    return createErrorResponse({
      message: error.message || "An unknown error occurred during extraction",
      stack: error.stack
    }, 500, null, 'unexpected_error');
  }
}
