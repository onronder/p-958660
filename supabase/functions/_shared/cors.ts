// CORS headers for all edge functions
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Keeping wildcard for development
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Production-ready CORS configuration with specific domain allowlist
export const getProductionCorsHeaders = (requestOrigin: string | null) => {
  // List of allowed origins (add more as needed)
  const allowedOrigins = [
    "https://app.flow-techs.com",
    "https://p-958660.vercel.app",
    "http://app.flow-techs.com",
    "http://p-958660.vercel.app",
    // Include your local development URLs if needed
    "http://localhost:3000",
    "http://localhost:5173"
  ];
  
  // If the request origin is in our allowlist, return it
  // Otherwise, fall back to the first allowed origin
  const origin = requestOrigin && allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : allowedOrigins[0];
  
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Credentials": "true"
  };
};
