
import { supabase } from "@/integrations/supabase/client";

// Helper to get the session token
export async function getAuthToken() {
  const { data: { session }, error: authError } = await supabase.auth.getSession();
  
  if (authError || !session) {
    throw new Error(authError?.message || "Authentication required");
  }
  
  return session.access_token;
}

// Helper to get the Supabase URL
export function getSupabaseUrl() {
  return import.meta.env.VITE_SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co';
}

// Helper to handle API errors
export function handleApiError(error: any, defaultMessage: string): never {
  console.error(`API Error: ${defaultMessage}`, error);
  
  // Check if this is a CORS error (they often appear as "Failed to fetch" or "Network Error")
  const errorMessage = error instanceof Error ? error.message : defaultMessage;
  if (errorMessage === "Failed to fetch" || errorMessage.includes("Network Error")) {
    throw new Error(`${defaultMessage} - CORS issue detected. Please check server configuration.`);
  }
  
  throw new Error(errorMessage);
}
