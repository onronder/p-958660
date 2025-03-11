
import { getSupabaseUrl, handleApiError, fetchWithAuth } from "./apiUtils";

// Function to export data to a destination
export async function exportToDestination(destinationId: string) {
  try {
    const url = `${getSupabaseUrl()}/functions/v1/export-to-destination`;
    
    console.log("Exporting to destination:", destinationId);
    
    const data = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify({
        destination_id: destinationId
      })
    });
    
    if (!data) {
      console.warn("No data returned from export API");
      throw new Error("Export failed: No response data");
    }
    
    return data;
  } catch (error) {
    console.error("Export to destination error:", error);
    handleApiError(error, "Failed to start export");
    throw error; // Re-throw to be handled by the calling component
  }
}
