
import { getProductionCorsHeaders } from "../_shared/cors.ts";

/**
 * Helper to create standardized error responses
 */
export function createErrorResponse(message: string, status: number, requestOrigin: string | null) {
  const responseCorsHeaders = getProductionCorsHeaders(requestOrigin);
  
  return new Response(
    JSON.stringify({ error: message }),
    { 
      status, 
      headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
    }
  );
}

/**
 * Helper to create standardized success responses
 */
export function createSuccessResponse(data: any, requestOrigin: string | null) {
  const responseCorsHeaders = getProductionCorsHeaders(requestOrigin);
  
  return new Response(
    JSON.stringify(data),
    { 
      status: 200, 
      headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
    }
  );
}
