
import { supabase } from "@/integrations/supabase/client";
import { devLogger } from '@/utils/logger';

/**
 * Maximum timeout for API requests in milliseconds
 */
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Create a promise with timeout
 */
export const createTimeoutPromise = (timeoutMs: number = DEFAULT_TIMEOUT) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Request timed out after ${timeoutMs}ms`)), timeoutMs);
  });
};

/**
 * Race a promise against a timeout
 */
export const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number = DEFAULT_TIMEOUT): Promise<T> => {
  const timeoutPromise = createTimeoutPromise(timeoutMs);
  return Promise.race([promise, timeoutPromise]) as Promise<T>;
};

/**
 * Log API request details
 */
export const logApiRequest = (endpoint: string, details: any) => {
  devLogger.debug(`Dataset Preview API`, `${endpoint} request`, details);
};

/**
 * Log API response details
 */
export const logApiResponse = (endpoint: string, response: any) => {
  devLogger.debug(`Dataset Preview API`, `${endpoint} response`, {
    hasData: !!response.data,
    hasError: !!response.error,
    status: response.status,
    statusText: response.statusText
  });
};

/**
 * Handle API errors and format response
 */
export const handleApiResponse = (response: any, endpoint: string) => {
  // If there's an error in the response, log and handle it
  if (response.error) {
    devLogger.error('Dataset Preview API', `${endpoint} error`, response.error);
    return { error: response.error };
  }
  
  // Check for application-level errors in the response data
  if (response.data && response.data.error) {
    devLogger.error('Dataset Preview API', `Application error in ${endpoint} response`, response.data.error);
    return { error: new Error(response.data.error) };
  }
  
  return response;
};

/**
 * Test connectivity to an Edge Function
 */
export const testEdgeFunctionConnectivity = async (functionName: string) => {
  try {
    devLogger.info('Dataset Preview API', `Testing connectivity to Edge Function: ${functionName}`);
    
    // Use the Supabase client to ping the function with a minimal payload
    const response = await withTimeout(
      supabase.functions.invoke(functionName, {
        method: "POST",
        body: { ping: true }
      }),
      5000 // 5 second timeout for connectivity test
    );
    
    if (response.error) {
      return { 
        success: false, 
        error: `Error connecting to ${functionName}: ${response.error.message || 'Unknown error'}`
      };
    }
    
    // Log detailed response for debugging
    devLogger.debug('Dataset Preview API', 'Edge Function connectivity test response', {
      functionName,
      status: response.status,
      hasData: !!response.data,
      dataContent: response.data
    });
    
    return { success: true };
  } catch (error) {
    devLogger.error('Dataset Preview API', `Edge Function connectivity test failed: ${functionName}`, error);
    
    // Provide more detailed error information
    let errorMessage = error instanceof Error ? error.message : String(error);
    let errorDetails = '';
    
    if (errorMessage.includes('Failed to fetch') || errorMessage.includes('Network')) {
      errorDetails = 'This appears to be a network connectivity issue. Check your internet connection.';
    } else if (errorMessage.includes('timeout')) {
      errorDetails = 'The function request timed out. The Edge Function may be overloaded or unresponsive.';
    } else if (errorMessage.includes('CORS') || errorMessage.includes('Access-Control')) {
      errorDetails = 'This may be a CORS issue. The Edge Function may not be configured to accept requests from this origin.';
    }
    
    return { 
      success: false, 
      error: errorMessage,
      details: errorDetails
    };
  }
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 500, // Start with 500ms delay
  factor: number = 2 // Exponential factor
): Promise<T> => {
  let retries = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (retries >= maxRetries) {
        devLogger.error('Dataset Preview API', `Max retries (${maxRetries}) reached`, error);
        throw error;
      }
      
      // Only retry on network errors or timeouts
      if (!(error instanceof Error) || 
          (!error.message.includes('timeout') && 
           !error.message.includes('network') && 
           !error.message.includes('fetch') &&
           !error.message.includes('Edge Function'))) {
        throw error;
      }
      
      retries++;
      devLogger.info('Dataset Preview API', `Retry attempt ${retries}/${maxRetries} after ${delay}ms`, { 
        error,
        retryCount: retries,
        maxRetries,
        delayMs: delay
      });
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Increase delay for next retry
      delay *= factor;
    }
  }
};
