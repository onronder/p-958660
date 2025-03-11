
import { getAuthToken, getSupabaseUrl, handleApiError } from "./apiUtils";

// Function to fetch destinations from the API
export async function fetchDestinations() {
  try {
    const token = await getAuthToken();
    const supabaseUrl = getSupabaseUrl();
    
    // Add console.log to debug request
    console.log("Fetching destinations from:", `${supabaseUrl}/functions/v1/destinations`);
    
    const response = await fetch(`${supabaseUrl}/functions/v1/destinations`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!response.ok) {
      console.error("Fetch destinations error status:", response.status);
      const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
      throw new Error(errorData.error || "Failed to fetch destinations");
    }
    
    const data = await response.json();
    console.log("Destinations data received:", data);
    return data.destinations;
  } catch (error) {
    console.error("Fetch destinations error:", error);
    handleApiError(error, "Failed to fetch destinations");
  }
}
