
import { supabase } from "@/integrations/supabase/client";
import { devLogger } from '@/utils/logger';
import { 
  logApiRequest, 
  logApiResponse, 
  withTimeout, 
  handleApiResponse,
  retryWithBackoff,
  testEdgeFunctionConnectivity
} from './apiBase';

/**
 * Execute a custom query against the data source
 */
export const executeCustomQuery = async (sourceId: string, customQuery: string) => {
  try {
    devLogger.info('Dataset Preview API', 'Executing custom query', { 
      sourceId, 
      queryLength: customQuery.length 
    });
    
    // Log the request parameters
    logApiRequest('Shopify-extract custom query', {
      source_id: sourceId,
      custom_query: customQuery,
      preview_only: true,
      limit: 5 // We specifically limit to 5 for preview
    });
    
    // Test connectivity to the edge function first
    const connectivityTest = await testEdgeFunctionConnectivity("shopify-extract");
    if (!connectivityTest.success) {
      devLogger.error('Dataset Preview API', 'Edge Function connectivity test failed', connectivityTest.error);
      return { 
        error: `Edge Function connectivity error: ${connectivityTest.error}. Please check your network connection or try again later.` 
      };
    }
    
    // Create a function to execute the request
    const executeRequest = async () => {
      // Log detailed info about the request
      devLogger.info('Dataset Preview API', 'Invoking shopify-extract function with parameters', {
        extraction_id: "preview",
        source_id: sourceId,
        custom_query_length: customQuery.length,
        preview_only: true,
        limit: 5
      });
      
      try {
        // Include all required parameters and be consistent with naming
        const response = await supabase.functions.invoke("shopify-extract", {
          body: {
            extraction_id: "preview",
            source_id: sourceId,
            custom_query: customQuery,
            preview_only: true,
            limit: 5 // We explicitly limit to 5 for preview
          }
        });
        
        // Log the response details
        devLogger.debug('Dataset Preview API', 'Raw response received', response);
        
        // Log the response, safely accessing properties
        logApiResponse('Shopify-extract custom query', response);
        
        return response;
      } catch (invokeError) {
        devLogger.error('Dataset Preview API', 'Error invoking edge function', invokeError);
        throw invokeError;
      }
    };
    
    // Execute with retry and timeout
    const response = await retryWithBackoff(
      () => withTimeout(executeRequest(), 60000), // Extend timeout to 60 seconds
      4, // Maximum 4 retries
      1000, // Start with 1 second delay 
      2 // Exponential factor
    );
    
    return handleApiResponse(response, 'Custom query');
  } catch (error: any) {
    devLogger.error('Dataset Preview API', 'Error executing custom query', error);
    
    // Format error message for better user experience
    let errorMessage = error.message || 'Failed to execute custom query';
    if (errorMessage.includes('timeout')) {
      errorMessage = 'The query took too long to execute. Please try again or simplify your query.';
    } else if (errorMessage.includes('Edge Function') || errorMessage.includes('Failed to fetch')) {
      errorMessage = 'Failed to connect to the Edge Function. Please check your network connection and try again.';
    } else if (errorMessage.includes('404')) {
      errorMessage = 'The shopify-extract Edge Function could not be found. Please make sure it is deployed correctly.';
    }
    
    return { error: errorMessage };
  }
};
