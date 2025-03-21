
/**
 * Service for executing extraction requests against Shopify API
 */
import { executeShopifyQuery } from "../shopify-api.ts";
import { extractResults } from "../extraction-utils.ts";

/**
 * Executes the extraction query against Shopify API and processes results
 */
export async function executeExtraction(params) {
  const { 
    credentials, 
    query, 
    variables, 
    extractionId = null,
    userId = null,
    sourceId = null,
    previewOnly = false,
    supabase,
    startTime = Date.now(),
    timeout = 30000
  } = params;
  
  const { apiToken, clientId, clientSecret, storeName } = credentials;
  
  try {
    console.log(`Executing ${previewOnly ? 'preview' : 'full'} extraction for Shopify store:`, storeName);
    
    // Update extraction status to running if not just a preview
    if (!previewOnly && extractionId) {
      await supabase
        .from("extractions")
        .update({ 
          status: "running", 
          started_at: new Date().toISOString(),
          progress: 0,
          status_message: "Starting extraction..."
        })
        .eq("id", extractionId);
    }
    
    // Execute Shopify GraphQL query with all available credentials
    const result = await executeShopifyQuery({
      shopName: storeName,
      apiToken,
      clientId,
      clientSecret,
      query,
      variables,
      apiVersion: "2023-10", // Could be made configurable
      timeout
    });
    
    if (result.error) {
      console.error("Shopify API error:", result.status, result.error);
      
      // Update extraction status if not a preview
      if (!previewOnly && extractionId) {
        await supabase
          .from("extractions")
          .update({ 
            status: "failed", 
            status_message: `Shopify API error: ${result.error}`,
            completed_at: new Date().toISOString()
          })
          .eq("id", extractionId);
      }
      
      return {
        success: false,
        error: { 
          message: result.error,
          details: result.details
        },
        status: result.status || 500,
        code: 'shopify_api_error'
      };
    }
    
    if (!result.data) {
      return {
        success: false,
        error: {
          message: "No data returned from Shopify API",
          details: { response_type: typeof result }
        },
        status: 500,
        code: 'empty_response'
      };
    }
    
    // Extract results
    const results = extractResults(result.data);
    console.log("Successfully extracted results:", results.length);
    
    // Generate a formatted sample for display
    const sample = results.length > 0 
      ? JSON.stringify(results.slice(0, Math.min(3, results.length)), null, 2)
      : null;
    
    // Update extraction with results for complete extraction
    if (!previewOnly && extractionId) {
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
        .eq("id", extractionId);
    }
    
    // Log a successful extraction
    if (userId) {
      EdgeRuntime.waitUntil(supabase
        .from("shopify_logs")
        .insert([
          {
            user_id: userId,
            store_name: storeName,
            api_key: clientId,
            error_message: null,
            error_details: {
              operation: previewOnly ? "preview" : "extraction",
              record_count: results.length,
              time_taken_ms: Date.now() - startTime || 0
            }
          }
        ]));
    }
    
    return {
      success: true,
      results,
      count: results.length,
      sample,
      extractionId
    };
  } catch (apiError) {
    console.error("Extraction API error:", apiError);
    
    // Update extraction status if not a preview
    if (!previewOnly && extractionId) {
      await supabase
        .from("extractions")
        .update({ 
          status: "failed", 
          status_message: `Error: ${apiError.message || "Unknown error"}`,
          completed_at: new Date().toISOString()
        })
        .eq("id", extractionId);
    }
    
    // Log the error to Supabase
    if (userId) {
      await supabase
        .from("shopify_logs")
        .insert([
          {
            user_id: userId,
            store_name: storeName,
            error_message: apiError.message,
            error_details: {
              stack: apiError.stack,
              cause: apiError.cause
            },
            api_key: clientId,
            http_status: 500
          }
        ]);
    }
    
    return {
      success: false,
      error: {
        message: apiError.message || "An unknown error occurred during extraction",
        stack: apiError.stack,
        cause: apiError.cause
      },
      status: 500,
      code: 'api_request_error'
    };
  }
}
