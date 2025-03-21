
// CORS headers utility for Supabase Edge Functions

/**
 * Returns CORS headers for production environment
 */
export function getProductionCorsHeaders(origin: string | null): Record<string, string> {
  // Default CORS headers
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  // If we have an origin, use it, otherwise allow all origins with '*'
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}
