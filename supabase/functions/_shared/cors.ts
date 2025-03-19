
/**
 * Get CORS headers for production use
 */
export function getProductionCorsHeaders(requestOrigin: string | null): HeadersInit {
  // List of allowed origins (add your frontend domains here)
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://app.flowtechs.io',
    'https://flowtechs.io',
    'https://eovyjotxecnkqjylwdnj.supabase.co',
    // Add your Lovable domains 
    'https://lovable.dev',
    'https://lovable.app',
    '.lovable.dev',
    '.lovable.app',
    '.lovableproject.com'
  ];
  
  // Check if the request origin is allowed
  // If no origin is provided or it's not in the allowedOrigins list, default to '*'
  let origin = '*';
  if (requestOrigin) {
    // Check if the origin matches any in our allowed list (including wildcards)
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.startsWith('.')) {
        // For wildcard domains (e.g. .lovable.app)
        return requestOrigin.endsWith(allowed);
      } else {
        return requestOrigin === allowed;
      }
    });
    
    // If the origin is specifically allowed, set it instead of '*'
    if (isAllowed) {
      origin = requestOrigin;
    }
  }
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Get development-friendly CORS headers (less strict)
 */
export function getDevCorsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };
}
