
import { getAuthToken, getSupabaseUrl, handleApiError } from "./apiUtils";

// Function to fetch destinations from the API
export async function fetchDestinations() {
  try {
    const token = await getAuthToken();
    const supabaseUrl = getSupabaseUrl();
    
    const response = await fetch(`${supabaseUrl}/functions/v1/destinations`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to fetch destinations");
    }
    
    const data = await response.json();
    return data.destinations;
  } catch (error) {
    handleApiError(error, "Failed to fetch destinations");
  }
}
