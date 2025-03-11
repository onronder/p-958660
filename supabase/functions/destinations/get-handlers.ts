
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.20.0";
import { corsHeaders } from "../_shared/cors.ts";

// Helper to create consistent responses
export function createResponse(data: any, status = 200) {
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

// Handler for fetching all destinations
export async function getDestinations(req: Request) {
  try {
    const user = await getUserFromAuth(req);
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Database error:", error);
      return createResponse({ error: error.message }, 500);
    }
    
    // Update the status to "Deleted" for any soft-deleted destinations
    const processedData = data.map(dest => {
      if (dest.is_deleted) {
        return { ...dest, status: 'Deleted' };
      }
      return dest;
    });
    
    return createResponse({ destinations: processedData });
  } catch (error) {
    console.error('Error in getDestinations:', error);
    return createResponse({ error: error.message }, error.status || 500);
  }
}

// Handler for fetching a single destination by ID
export async function getDestinationById(req: Request, id: string) {
  try {
    const user = await getUserFromAuth(req);
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return createResponse({ error: "Destination not found" }, 404);
      }
      return createResponse({ error: error.message }, 500);
    }
    
    // Update status if it's deleted
    if (data.is_deleted) {
      data.status = 'Deleted';
    }
    
    return createResponse({ destination: data });
  } catch (error) {
    console.error('Error in getDestinationById:', error);
    return createResponse({ error: error.message }, error.status || 500);
  }
}
