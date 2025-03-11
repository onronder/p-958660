
import { supabase } from "@/integrations/supabase/client";

// Helper to get the session token
export async function getAuthToken() {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error("Auth error:", authError);
      throw new Error(authError.message || "Authentication required");
    }
    
    if (!session) {
      console.error("No session found");
      throw new Error("Authentication required");
    }
    
    return session.access_token;
  } catch (error) {
    console.error("Failed to get auth token:", error);
    throw new Error("Authentication required");
  }
}

// Helper to get the Supabase URL
export function getSupabaseUrl() {
  return import.meta.env.VITE_SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co';
}

// Helper to handle API errors
export function handleApiError(error: any, defaultMessage: string): never {
  console.error(`API Error: ${defaultMessage}`, error);
  
  // Check for specific error types
  let errorMessage = defaultMessage;
  
  if (error instanceof Error) {
    errorMessage = error.message;
    
    // Check if this is a CORS error
    if (errorMessage === "Failed to fetch" || errorMessage.includes("Network Error")) {
      errorMessage = `${defaultMessage} - CORS issue detected. Please check server configuration.`;
    }
    
    // Check if this is an authentication error
    if (errorMessage.includes("Authentication required") || 
        errorMessage.includes("Invalid token") || 
        errorMessage.includes("JWT")) {
      errorMessage = "Authentication required. Please log in again.";
    }
  }
  
  throw new Error(errorMessage);
}

// Helper to perform a fetch request with proper error handling
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    const token = await getAuthToken();
    
    // Set default headers
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers
    };
    
    // Perform the fetch request
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    // Check for non-OK responses
    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: `HTTP error ${response.status}` };
      }
      
      throw new Error(errorData.error || `Request failed with status: ${response.status}`);
    }
    
    // Parse the response as JSON
    const data = await response.json();
    return data;
  } catch (error) {
    // Let the caller handle the error
    throw error;
  }
}
