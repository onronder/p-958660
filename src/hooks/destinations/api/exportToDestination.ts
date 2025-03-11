
import { getAuthToken, getSupabaseUrl, handleApiError } from "./apiUtils";

// Function to export data to a destination
export async function exportToDestination(destinationId: string) {
  try {
    const token = await getAuthToken();
    const supabaseUrl = getSupabaseUrl();
    
    const response = await fetch(`${supabaseUrl}/functions/v1/export-to-destination`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        destination_id: destinationId
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to start export");
    }
    
    return data;
  } catch (error) {
    handleApiError(error, "Failed to start export");
  }
}
