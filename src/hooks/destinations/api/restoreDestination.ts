
import { getSupabaseUrl, handleApiError, fetchWithAuth } from "./apiUtils";

export const restoreDestination = async (id: string): Promise<any> => {
  try {
    const url = `${getSupabaseUrl()}/functions/v1/destinations/${id}/restore`;
    
    console.log("Restoring destination:", url);
    
    const result = await fetchWithAuth(url, {
      method: "POST"
    });
    
    if (!result.destination) {
      console.warn("No destination in the restoration response:", result);
      throw new Error("Destination restoration failed: No destination data returned");
    }
    
    return result.destination;
  } catch (error) {
    console.error("Restore destination error:", error);
    handleApiError(error, "Error restoring destination");
    throw error; // Re-throw to be handled by the calling component
  }
};
