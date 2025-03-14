
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { getProductionCorsHeaders } from "../_shared/cors.ts";

// Get appropriate CORS headers based on request origin
export const corsHeaders = getProductionCorsHeaders(null);

// Create Supabase client with service role key
export function createSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );
}

// Validate user with JWT token
export async function validateUser(supabase: any, token: string | null) {
  if (!token) {
    throw new Error('Authentication required');
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Error validating user token:', error?.message);
      throw new Error('Invalid or expired token');
    }
    
    return user;
  } catch (error) {
    console.error('Error validating user:', error);
    throw new Error('Authentication failed');
  }
}
