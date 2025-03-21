
import { createErrorResponse, createSuccessResponse } from "./response-utils.ts";
import { getShopifyCredentials } from "./services/credentials-service.ts";
import { prepareQuery } from "./services/query-service.ts";
import { executePreview } from "./services/preview-execution.ts";

/**
 * Handles preview requests for Shopify queries 
 */
export async function handlePreviewRequest(requestData, supabase, corsHeaders) {
  const previewStartTime = Date.now();
  
  try {
    const { user, source_id, custom_query, template_key, limit = 5, include_all_credentials = false } = requestData;
    
    console.log("Processing preview request for source:", source_id);
    console.log("Preview parameters:", { 
      hasCustomQuery: !!custom_query, 
      hasTemplateKey: !!template_key,
      limit,
      includeAllCredentials: include_all_credentials
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
      limit
    });
    
    if (!queryResult.success) {
      return createErrorResponse(
        queryResult.error,
        queryResult.status,
        null,
        queryResult.code
      );
    }
    
    // Execute the preview request
    const previewResult = await executePreview({
      credentials: credentialsResult.credentials,
      query: queryResult.query,
      variables: queryResult.variables,
      userId: user.id,
      sourceId: source_id,
      includeAllCredentials: include_all_credentials,
      supabase,
      startTime: previewStartTime,
      timeout: 15000 // 15 second timeout for preview
    });
    
    if (!previewResult.success) {
      return createErrorResponse(
        previewResult.error,
        previewResult.status,
        null,
        previewResult.code
      );
    }
    
    // Return the preview results
    return createSuccessResponse({ 
      results: previewResult.results,
      count: previewResult.count,
      preview: true,
      sample: previewResult.sample
    }, null);
    
  } catch (error) {
    console.error("Preview error:", error);
    return createErrorResponse({
      message: error.message || "An unknown error occurred during preview",
      stack: error.stack
    }, 500, null, 'unexpected_error');
  }
}
