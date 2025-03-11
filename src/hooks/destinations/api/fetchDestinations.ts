
import { getSupabaseUrl, handleApiError, fetchWithAuth } from "./apiUtils";

// Function to fetch destinations from the API
export async function fetchDestinations() {
  try {
    const supabaseUrl = getSupabaseUrl();
    const url = `${supabaseUrl}/functions/v1/destinations`;
    
    // Add console.log to debug request
    console.log("Fetching destinations from:", url);
    
    const data = await fetchWithAuth(url);
    
    console.log("Destinations data received:", data);
    return data.destinations;
  } catch (error) {
    console.error("Fetch destinations error:", error);
    handleApiError(error, "Failed to fetch destinations");
  }
}
