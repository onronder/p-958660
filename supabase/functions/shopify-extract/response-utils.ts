
/**
 * Create an error response with proper CORS headers
 */
export function createErrorResponse(message: string, status: number, requestOrigin: string | null) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': requestOrigin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status, 
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      } 
    }
  );
}

/**
 * Create a success response with proper CORS headers
 */
export function createSuccessResponse(data: any, requestOrigin: string | null) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': requestOrigin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  return new Response(
    JSON.stringify(data),
    { 
      status: 200, 
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      } 
    }
  );
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(requestOrigin: string | null) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': requestOrigin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  
  return new Response(null, { 
    status: 204, 
    headers: corsHeaders 
  });
}
