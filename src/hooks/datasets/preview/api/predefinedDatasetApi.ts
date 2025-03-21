
import { supabase } from "@/integrations/supabase/client";
import { devLogger } from '@/utils/logger';
import { logApiRequest, logApiResponse, withTimeout, handleApiResponse } from './apiBase';

/**
 * Execute a predefined dataset template
 */
export const executePredefinedDataset = async (templateKey: string, sourceId: string) => {
  try {
    devLogger.info('Dataset Preview API', 'Executing predefined dataset', { 
      templateKey, 
      sourceId 
    });
    
    // Log the request parameters for debugging
    logApiRequest('Shopify-extract edge function', {
      source_id: sourceId,
      template_key: templateKey,
      preview_only: true,
      limit: 5 // Set limit to 5 for preview
    });
    
    // Create the request promise with the edge function call
    const requestPromise = supabase.functions.invoke("shopify-extract", {
      body: {
        source_id: sourceId,
        template_key: templateKey,
        preview_only: true,
        limit: 5, // Set limit to 5 for preview
        include_all_credentials: true // Signal to include all possible credentials
      }
    });
    
    // Execute with timeout - increase timeout to 60 seconds
    const response = await withTimeout(requestPromise, 60000);
    
    // Log the response
    logApiResponse('Shopify-extract edge function', response);
    
    return handleApiResponse(response, 'Predefined dataset');
  } catch (error: any) {
    devLogger.error('Dataset Preview API', 'Error executing predefined dataset', error);
    
    // Format error message for better user experience
    let errorMessage = error.message || 'Failed to execute predefined dataset';
    
    if (errorMessage.includes('timeout')) {
      errorMessage = 'The query took too long to execute. Please try again later.';
    } else if (errorMessage.includes('Edge Function') || errorMessage.includes('Failed to fetch')) {
      errorMessage = 'Failed to connect to the Edge Function. Please check your network connection and try again.';
    }
    
    return { error: errorMessage };
  }
};
