
import { supabase } from "@/integrations/supabase/client";
import { devLogger } from '@/utils/logger';
import { 
  logApiRequest, 
  logApiResponse, 
  withTimeout, 
  handleApiResponse,
  retryWithBackoff
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
    
    // Create a function to execute the request
    const executeRequest = async () => {
      const response = await supabase.functions.invoke("shopify-extract", {
        body: {
          extraction_id: "preview",
          source_id: sourceId,
          custom_query: customQuery,
          preview_only: true,
          limit: 10
        }
      });
      
      // Log the response
      logApiResponse('Shopify-extract custom query', response);
      
      return response;
    };
    
    // Execute with retry and timeout
    const response = await retryWithBackoff(
      () => withTimeout(executeRequest(), 45000), // 45 second timeout with retries
      2 // Maximum 2 retries
    );
    
    return handleApiResponse(response, 'Custom query');
  } catch (error: any) {
    devLogger.error('Dataset Preview API', 'Error executing custom query', error);
    
    // Format error message for better user experience
    let errorMessage = error.message || 'Failed to execute custom query';
    if (errorMessage.includes('timeout')) {
      errorMessage = 'The query took too long to execute. Please try again or simplify your query.';
    } else if (errorMessage.includes('Edge Function')) {
      errorMessage = 'Failed to connect to the Edge Function. Please check your network connection and try again.';
    }
    
    return { error: errorMessage };
  }
};
