
import { supabase } from "@/integrations/supabase/client";
import { devLogger } from '@/utils/logger';

/**
 * Create a promise with timeout
 */
export const createTimeoutPromise = (timeoutMs: number = 30000) => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
  });
};

/**
 * Race a promise against a timeout
 */
export const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> => {
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
    hasError: !!response.error
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
