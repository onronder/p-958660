
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
  const url = import.meta.env.VITE_SUPABASE_URL;
  if (!url) {
    console.warn("VITE_SUPABASE_URL is not defined in environment variables, using fallback URL");
    // Fall back to the default URL
    return 'https://eovyjotxecnkqjylwdnj.supabase.co';
  }
  return url;
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
      errorMessage = `${defaultMessage} - Network connectivity issue detected. Please check your internet connection.`;
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

// Helper to perform a fetch request with proper error handling and CORS support
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  try {
    const token = await getAuthToken();
    
    // Set default headers
    const headers = {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers
    };
    
    // CORS preflight handling
    const fetchOptions = {
      ...options,
      headers,
      mode: 'cors' as RequestMode,
      credentials: 'same-origin' as RequestCredentials
    };
    
    console.log(`Making ${options.method || 'GET'} request to: ${url}`);
    
    // Perform the fetch request
    const response = await fetch(url, fetchOptions);
    
    // Check for non-OK responses
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        try {
          const errorText = await response.text();
          errorData = { error: errorText || `HTTP error ${response.status}` };
        } catch {
          errorData = { error: `HTTP error ${response.status}` };
        }
      }
      
      throw new Error(errorData.error || `Request failed with status: ${response.status}`);
    }
    
    // Parse the response as JSON
    const data = await response.json();
    return data;
  } catch (error) {
    // Let the caller handle the error
    console.error("Fetch error:", error);
    throw error;
  }
}
