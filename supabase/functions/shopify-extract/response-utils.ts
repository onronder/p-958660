
import { getProductionCorsHeaders } from "../_shared/cors.ts";

/**
 * Create a standardized error response
 */
export function createErrorResponse(message: string, status: number = 500, requestOrigin: string | null = null) {
  const corsHeaders = getProductionCorsHeaders(requestOrigin);
  
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
