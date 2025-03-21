
/**
 * Utility functions for handling responses in Edge Functions
 */

/**
 * Create a standardized success response with proper CORS headers
 */
export function createSuccessResponse(data: any, origin: string | null = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(origin ? {'Access-Control-Allow-Origin': origin} : {'Access-Control-Allow-Origin': '*'}),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  return new Response(
    JSON.stringify(data),
    { status: 200, headers }
  );
}

/**
 * Create a standardized error response with proper CORS headers and detailed error information
 */
export function createErrorResponse(
  error: any, 
  status: number = 500, 
  origin: string | null = null,
  errorType: string = 'general_error'
) {
  const headers = {
    'Content-Type': 'application/json',
    ...(origin ? {'Access-Control-Allow-Origin': origin} : {'Access-Control-Allow-Origin': '*'}),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  // Format the error object to include detailed information
  const errorResponse = {
    error: typeof error === 'string' ? error : error.message || 'Unknown error',
    error_type: errorType,
    details: error.details || null,
    timestamp: new Date().toISOString()
  };
  
  return new Response(
    JSON.stringify(errorResponse),
    { status, headers }
  );
}

/**
 * Handle CORS preflight requests with proper headers
 */
export function handleCorsPreflightRequest(origin: string | null = null) {
  const headers = {
    ...(origin ? {'Access-Control-Allow-Origin': origin} : {'Access-Control-Allow-Origin': '*'}),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  };
  
  return new Response(null, { headers });
}

/**
 * Create a response for a too large payload
 */
export function createPayloadTooLargeResponse(origin: string | null = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(origin ? {'Access-Control-Allow-Origin': origin} : {'Access-Control-Allow-Origin': '*'}),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  return new Response(
    JSON.stringify({
      error: 'Dataset too large for preview',
      error_type: 'size_limit_exceeded',
      details: 'The requested dataset exceeds the maximum size limit for preview generation. Try with a smaller date range or more restrictive filters.',
      timestamp: new Date().toISOString()
    }),
    { status: 413, headers }
  );
}

/**
 * Create a timeout response
 */
export function createTimeoutResponse(origin: string | null = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(origin ? {'Access-Control-Allow-Origin': origin} : {'Access-Control-Allow-Origin': '*'}),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  return new Response(
    JSON.stringify({
      error: 'Request timed out',
      error_type: 'timeout',
      details: 'The request took too long to process. The operation might involve too much data or the server might be experiencing high load.',
      timestamp: new Date().toISOString()
    }),
    { status: 408, headers }
  );
}
