
// Import the new production CORS helper
import { corsHeaders, getProductionCorsHeaders } from "../_shared/cors.ts";

// Helper for handling CORS preflight requests
export function handleCorsPreflightRequest(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

// Helper for setting CORS headers based on request origin
export function getCorsHeadersForRequest(req: Request) {
  const requestOrigin = req.headers.get("origin");
  // Use production CORS headers with specific origin checking
  return getProductionCorsHeaders(requestOrigin);
}
