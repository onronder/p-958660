
import { supabase } from "@/integrations/supabase/client";
import { devLogger } from '@/utils/logger';

/**
 * Log API request details
 */
export const logApiRequest = (endpoint: string, requestData: any) => {
  devLogger.debug('API Request', `Calling ${endpoint}`, requestData);
};

/**
 * Log API response details
 */
export const logApiResponse = (endpoint: string, response: any) => {
  if (response.error) {
    devLogger.error('API Response', `Error from ${endpoint}`, {
      error: response.error,
      status: response.status
    });
  } else {
    devLogger.debug('API Response', `Success from ${endpoint}`, {
      hasData: !!response.data,
      dataType: response.data ? typeof response.data : 'undefined'
    });
  }
};

/**
 * Apply a timeout to a promise
 */
export const withTimeout = (promise: Promise<any>, ms: number) => {
  let timeoutId: NodeJS.Timeout;
  
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Request timed out after ${ms}ms`));
    }, ms);
  });
  
  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
};

/**
 * Handle standard API response and extract data
 */
export const handleApiResponse = (response: any, operationName: string) => {
  if (response.error) {
    return { 
      error: `Error during ${operationName}: ${response.error.message || JSON.stringify(response.error)}` 
    };
  }
  
  if (!response.data) {
    return { error: `No data returned from ${operationName}` };
  }
  
  // Handle error message in the data property
  if (response.data.error) {
    return { 
      error: `${operationName} failed: ${response.data.error.message || response.data.error}` 
    };
  }
  
  return {
    data: response.data.results || response.data.data || response.data,
    sample: response.data.sample || null
  };
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number,
  initialDelay: number,
  backoffFactor: number
): Promise<T> => {
  let retries = 0;
  let delay = initialDelay;
  
  while (true) {
    try {
      return await fn();
    } catch (error) {
      retries++;
      
      if (retries >= maxRetries) {
        throw error;
      }
      
      devLogger.warn(
        'API Request', 
        `Attempt ${retries} failed, retrying in ${delay}ms`, 
        { error: error.message }
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= backoffFactor;
    }
  }
};

/**
 * Test if an edge function is reachable
 */
export const testEdgeFunctionConnectivity = async (functionName: string): Promise<{ success: boolean, error?: string }> => {
  try {
    devLogger.info('API Connectivity Test', `Testing connectivity to ${functionName} function`);
    
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: { ping: true }
    });
    
    if (error) {
      devLogger.error('API Connectivity Test', `Failed to connect to ${functionName}`, error);
      return { 
        success: false, 
        error: error.message || 'Unknown error during connectivity test' 
      };
    }
    
    devLogger.info('API Connectivity Test', `Successfully connected to ${functionName}`);
    return { success: true };
  } catch (error) {
    devLogger.error('API Connectivity Test', `Error testing connectivity to ${functionName}`, error);
    return { 
      success: false, 
      error: error.message || 'Unknown error during connectivity test' 
    };
  }
};
