
// Common CORS headers for cross-origin requests
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Handle CORS preflight requests
 */
export const handleCorsPreflightRequest = (origin?: string | null) => {
  const headers = { ...corsHeaders };
  
  // If specific origin is provided, use it instead of wildcard
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  
  return new Response(null, {
    status: 204, // No content
    headers
  });
};

/**
 * Create a standardized success response
 */
export const createSuccessResponse = (data: any, origin?: string | null) => {
  const headers: Record<string, string> = { ...corsHeaders };
  
  // If specific origin is provided, use it instead of wildcard
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  
  return new Response(
    JSON.stringify(data),
    {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    }
  );
};

/**
 * Create a standardized error response
 */
export const createErrorResponse = (error: any, statusCode: number = 500, origin?: string | null) => {
  // Format the error object
  const errorObject = typeof error === 'string' 
    ? { message: error } 
    : error;
  
  const headers: Record<string, string> = { ...corsHeaders };
  
  // If specific origin is provided, use it instead of wildcard
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  
  return new Response(
    JSON.stringify({ error: errorObject }),
    {
      status: statusCode,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      }
    }
  );
};
