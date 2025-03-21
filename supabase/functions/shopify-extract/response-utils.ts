
/**
 * Utility functions for handling responses in Edge Functions
 */

/**
 * Create a standardized success response
 */
export function createSuccessResponse(data, origin = null) {
  const headers = {
    'Content-Type': 'application/json',
    ...(origin ? {'Access-Control-Allow-Origin': origin} : {}),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  return new Response(
    JSON.stringify(data),
    { status: 200, headers }
  );
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(error, status = 500, origin = null, errorType = 'general_error') {
  const headers = {
    'Content-Type': 'application/json',
    ...(origin ? {'Access-Control-Allow-Origin': origin} : {}),
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
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(origin = null) {
  const headers = {
    ...(origin ? {'Access-Control-Allow-Origin': origin} : {'Access-Control-Allow-Origin': '*'}),
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  };
  
  return new Response(null, { headers });
}
