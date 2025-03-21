
/**
 * Service for executing preview requests against Shopify API
 */
import { executeShopifyQuery } from "../shopify-api.ts";
import { extractResults } from "../extraction-utils.ts";

/**
 * Executes the preview query against Shopify API and processes results
 */
export async function executePreview(params) {
  const { 
    credentials, 
    query, 
    variables, 
    userId,
    sourceId,
    includeAllCredentials = false,
    supabase,
    timeout = 15000 
  } = params;
  
  const { apiToken, clientId, clientSecret, storeName } = credentials;
  
  try {
    console.log("Executing GraphQL query to Shopify store:", storeName);
    
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
      
      // Log the error to Supabase
      if (userId) {
        await supabase
          .from("shopify_logs")
          .insert([
            {
              user_id: userId,
              store_name: storeName,
              error_message: result.error,
              error_details: result.details,
              api_key: clientId,
              http_status: result.status
            }
          ]);
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
    
    // Save a preview record in the database but don't wait for it to complete
    if (includeAllCredentials && userId && sourceId) {
      try {
        EdgeRuntime.waitUntil(supabase
          .from("user_datasets")
          .insert([
            {
              user_id: userId,
              source_id: sourceId,
              name: `Preview - ${new Date().toISOString().split('T')[0]}`,
              description: "Preview dataset",
              dataset_type: "preview",
              status: "preview_generated",
              query_params: {
                custom_query: !!query,
                template_key: null,
                limit: variables.first
              },
              record_count: results.length
            }
          ]));
      } catch (dbError) {
        // Just log but don't fail the request
        console.error("Error saving preview dataset:", dbError);
      }
    }
    
    // Log a successful preview
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
              operation: "preview_generation",
              record_count: results.length,
              time_taken_ms: Date.now() - params.startTime || 0
            }
          }
        ]));
    }
    
    return {
      success: true,
      results,
      count: results.length,
      sample
    };
  } catch (apiError) {
    console.error("Preview API error:", apiError);
    
    // Handle specific error types
    if (apiError.message?.includes('timeout')) {
      return {
        success: false,
        error: {
          message: "Request timed out",
          details: { error: apiError.message }
        },
        status: 408,
        code: 'timeout'
      };
    }
    
    if (apiError.message?.includes('too large') || apiError.message?.includes('payload')) {
      return {
        success: false,
        error: {
          message: "Dataset too large for preview",
          details: { error: apiError.message }
        },
        status: 413,
        code: 'size_limit_exceeded'
      };
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
        message: apiError.message || "An unknown error occurred during preview",
        stack: apiError.stack,
        cause: apiError.cause
      },
      status: 500,
      code: 'api_request_error'
    };
  }
}
