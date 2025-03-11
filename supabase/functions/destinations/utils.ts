
// Improved utils for destinations edge function with better CORS handling
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.20.0";

// Define CORS headers allowing requests from all origins
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

// Create a Supabase client for the edge function
export function getSupabaseClient(req: Request) {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader) {
    throw new Error("Missing Authorization header");
  }
  
  // Get Supabase URL and Key from environment variables
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase URL or service key");
  }
  
  // Create a client with the service role key
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
}

// Helper to create consistent responses
export function createJsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: new Headers({
      ...corsHeaders,
      "Content-Type": "application/json",
    }),
  });
}

// Helper function to verify user authentication
export async function getUserFromAuth(req: Request) {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader) {
    throw { status: 401, message: "Missing Authorization header" };
  }
  
  try {
    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || "",
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw { status: 401, message: "Invalid authorization token" };
    }
    
    return user;
  } catch (error) {
    console.error("Auth error:", error);
    throw { 
      status: error.status || 401, 
      message: error.message || "Authentication failed" 
    };
  }
}
