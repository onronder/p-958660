
// Helper functions for Shopify OAuth process

// CORS headers for all responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create an error response with proper CORS headers
export const createErrorResponse = (message: string, status = 400, details?: any) => {
  console.error(message, details);
  return new Response(
    JSON.stringify({ 
      error: message, 
      ...(details && { details })
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" }, status }
  );
};

// Create a success response with proper CORS headers
export const createSuccessResponse = (data: any) => {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
};

// Log the availability of environment variables (without exposing values)
export const logEnvironmentVariables = () => {
  const variables = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SHOPIFY_CLIENT_ID",
    "SHOPIFY_CLIENT_SECRET",
    "FLOWTECHS_REDIRECT_URI"
  ];
  
  const availability = variables.reduce((acc, varName) => {
    acc[varName] = Boolean(Deno.env.get(varName));
    return acc;
  }, {} as Record<string, boolean>);
  
  console.log("Environment variables check:", availability);
  return availability;
};

// Validate that required environment variables are present
export const validateEnvironmentVariables = () => {
  const SHOPIFY_CLIENT_ID = Deno.env.get('SHOPIFY_CLIENT_ID');
  const SHOPIFY_CLIENT_SECRET = Deno.env.get('SHOPIFY_CLIENT_SECRET');
  const FLOWTECHS_REDIRECT_URI = Deno.env.get('FLOWTECHS_REDIRECT_URI');
  
  if (!SHOPIFY_CLIENT_ID || !SHOPIFY_CLIENT_SECRET || !FLOWTECHS_REDIRECT_URI) {
    throw new Error("Missing required environment variables");
  }
  
  return { SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET, FLOWTECHS_REDIRECT_URI };
};
