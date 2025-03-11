
import { getSupabaseUrl, handleApiError, fetchWithAuth } from "./apiUtils";

// Function to fetch destinations from the API
export async function fetchDestinations() {
  try {
    const supabaseUrl = getSupabaseUrl();
    const url = `${supabaseUrl}/functions/v1/destinations`;
    
    // Add console.log to debug request
    console.log("Fetching destinations from:", url);
    
    // Use the enhanced fetchWithAuth utility
    const data = await fetchWithAuth(url);
    
    console.log("Destinations data received:", data);
    
    if (!data.destinations) {
      console.warn("No destinations array in the response:", data);
      return []; // Return empty array to avoid undefined errors
    }
    
    return data.destinations;
  } catch (error) {
    console.error("Fetch destinations error:", error);
    
    // Provide a more helpful error message
    if (error instanceof Error && error.message.includes("CORS")) {
      handleApiError(error, "Failed to fetch destinations due to CORS policy. This is likely a server configuration issue.");
    } else {
      handleApiError(error, "Failed to fetch destinations");
    }
    
    // Return empty array to prevent UI breakage
    return [];
  }
}
