
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
      custom_query: customQuery
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
        limit: 10
      });
      
      const response = await supabase.functions.invoke("shopify-extract", {
        body: {
          extraction_id: "preview",
          source_id: sourceId,
          custom_query: customQuery,
          preview_only: true,
          limit: 10
        }
      });
      
      // Log the response, safely accessing properties
      logApiResponse('Shopify-extract custom query', response);
      
      // Log more detailed info for debugging, safely accessing status property
      devLogger.debug('Dataset Preview API', 'Response details', {
        // Fix: Use safer property access with 'in' operator
        status: 'status' in response ? response.status : 'unknown',
        hasData: !!response.data,
        hasError: !!response.error,
        errorMessage: response.error?.message,
        dataType: response.data ? typeof response.data : 'undefined',
        hasResults: response.data?.results?.length > 0
      });
      
      return response;
    };
    
    // Execute with retry and timeout
    const response = await retryWithBackoff(
      () => withTimeout(executeRequest(), 45000), // 45 second timeout with retries
      3, // Maximum 3 retries
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
    }
    
    // Add more detailed guidance to help troubleshoot
    errorMessage += ' If this issue persists, please check the following:';
    errorMessage += '\n1. Ensure you have a stable internet connection';
    errorMessage += '\n2. Verify your Shopify credentials are correct';
    errorMessage += '\n3. Check if the Supabase Edge Function is deployed correctly';
    errorMessage += '\n4. Review the developer logs for more detailed error information';
    
    return { error: errorMessage };
  }
};
