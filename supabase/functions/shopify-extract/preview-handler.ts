
import { executeShopifyQuery } from "./shopify-api.ts";
import { extractResults } from "./extraction-utils.ts";
import { createErrorResponse, createSuccessResponse } from "./response-utils.ts";

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
    
    // For Shopify sources, get the credentials
    if (source.source_type.toLowerCase() !== "shopify") {
      return createErrorResponse({
        message: "Only Shopify sources are supported currently",
        details: { provided_type: source.source_type }
      }, 400, null, 'invalid_source_type');
    }
    
    // Get Shopify credentials from the source
    if (!source.credentials) {
      console.error("Missing credentials in source:", source);
      return createErrorResponse({
        message: "Source credentials are missing or invalid",
        details: { credential_info: "Missing credentials" }
      }, 400, null, 'invalid_credentials');
    }
    
    // Use source ID as credential ID if it's not provided in the credentials
    const credentialId = source.credentials.credential_id || source.id;
    console.log("Using credential ID:", credentialId);
    
    // Get Shopify credentials
    const { data: shopifyCredentials, error: credentialsError } = await supabase
      .from("shopify_credentials")
      .select("*")
      .eq("id", credentialId)
      .single();
    
    if (credentialsError || !shopifyCredentials) {
      console.error("Credentials error:", credentialsError);
      return createErrorResponse({
        message: "Shopify credentials not found",
        details: credentialsError
      }, 404, null, 'credentials_not_found');
    }
    
    // Validate required credentials
    if (!shopifyCredentials.store_name || !shopifyCredentials.api_token) {
      console.error("Missing required Shopify credentials:", {
        hasStoreName: !!shopifyCredentials.store_name,
        hasApiToken: !!shopifyCredentials.api_token
      });
      
      return createErrorResponse({
        message: "Incomplete Shopify credentials (missing store name or API token)",
        details: {
          has_store_name: !!shopifyCredentials.store_name,
          has_api_token: !!shopifyCredentials.api_token
        }
      }, 400, null, 'incomplete_credentials');
    }
    
    console.log("Executing GraphQL query to Shopify store:", shopifyCredentials.store_name);
    
    // Extract all available credentials
    const clientId = shopifyCredentials.client_id || shopifyCredentials.api_key;
    const clientSecret = shopifyCredentials.client_secret || shopifyCredentials.api_secret;
    const apiToken = shopifyCredentials.api_token || shopifyCredentials.access_token;
    const storeName = shopifyCredentials.store_name;
    
    // Log available credentials (safely, without exposing actual values)
    console.log("Using credentials:", {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasApiToken: !!apiToken,
      storeName
    });
    
    // Execute the query directly
    const previewLimit = Math.min(limit || 5, 5); // Strictly enforce 5 record limit for preview
    const variables = { first: previewLimit };
    const apiVersion = "2023-10"; // Could be made configurable
    
    // Log query for debugging
    if (custom_query) {
      console.log("Custom GraphQL query:", custom_query.substring(0, 200) + "...");
    } else if (template_key) {
      console.log("Using template key:", template_key);
    }
    
    try {
      // Execute Shopify GraphQL query with all available credentials
      const result = await executeShopifyQuery({
        shopName: storeName,
        apiToken,
        clientId,
        clientSecret,
        query: custom_query,
        variables,
        apiVersion,
        timeout: 15000 // 15 second timeout for preview
      });
      
      if (result.error) {
        console.error("Shopify API error:", result.status, result.error);
        
        // Log the error to Supabase
        await supabase
          .from("shopify_logs")
          .insert([
            {
              user_id: user.id,
              store_name: storeName,
              error_message: result.error,
              error_details: result.details,
              api_key: clientId,
              http_status: result.status
            }
          ]);
        
        return createErrorResponse({ 
          message: result.error,
          details: result.details
        }, result.status || 500, null, 'shopify_api_error');
      }
      
      if (!result.data) {
        return createErrorResponse({
          message: "No data returned from Shopify API",
          details: { response_type: typeof result }
        }, 500, null, 'empty_response');
      }
      
      // Extract results
      const results = extractResults(result.data);
      console.log("Successfully extracted results:", results.length);
      
      // Generate a formatted sample for display
      const sample = results.length > 0 
        ? JSON.stringify(results.slice(0, Math.min(3, results.length)), null, 2)
        : null;
      
      // Save a preview record in the database but don't wait for it to complete
      if (include_all_credentials) {
        try {
          EdgeRuntime.waitUntil(supabase
            .from("user_datasets")
            .insert([
              {
                user_id: user.id,
                source_id: source_id,
                name: `Preview - ${new Date().toISOString().split('T')[0]}`,
                description: "Preview dataset",
                dataset_type: "preview",
                status: "preview_generated",
                query_params: {
                  custom_query: !!custom_query,
                  template_key: template_key || null,
                  limit: previewLimit
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
      EdgeRuntime.waitUntil(supabase
        .from("shopify_logs")
        .insert([
          {
            user_id: user.id,
            store_name: storeName,
            api_key: clientId,
            error_message: null,
            error_details: {
              operation: "preview_generation",
              record_count: results.length,
              time_taken_ms: Date.now() - previewStartTime
            }
          }
        ]));
      
      // Return the preview results
      return createSuccessResponse({ 
        results,
        count: results.length,
        preview: true,
        sample
      }, origin);
    } catch (apiError) {
      console.error("Preview API error:", apiError);
      
      // Handle specific error types
      if (apiError.message?.includes('timeout')) {
        return createErrorResponse({
          message: "Request timed out",
          details: { error: apiError.message }
        }, 408, null, 'timeout');
      }
      
      if (apiError.message?.includes('too large') || apiError.message?.includes('payload')) {
        return createErrorResponse({
          message: "Dataset too large for preview",
          details: { error: apiError.message }
        }, 413, null, 'size_limit_exceeded');
      }
      
      // Log the error to Supabase
      await supabase
        .from("shopify_logs")
        .insert([
          {
            user_id: user.id,
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
      
      return createErrorResponse({
        message: apiError.message || "An unknown error occurred during preview",
        stack: apiError.stack,
        cause: apiError.cause
      }, 500, null, 'api_request_error');
    }
  } catch (error) {
    console.error("Preview error:", error);
    return createErrorResponse({
      message: error.message || "An unknown error occurred during preview",
      stack: error.stack
    }, 500, null, 'unexpected_error');
  }
}
