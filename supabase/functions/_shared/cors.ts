
// CORS headers for all edge functions
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow requests from any origin
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// You can also set up more specific CORS settings if needed:
// export const getCorsHeaders = (allowedOrigins: string[] = []) => {
//   const origin = allowedOrigins.length > 0 ? allowedOrigins : ["*"];
//   return {
//     "Access-Control-Allow-Origin": origin.join(", "),
//     "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
//   };
// };
