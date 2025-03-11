
import { getSupabaseUrl, handleApiError, fetchWithAuth } from "./apiUtils";

export const restoreDestination = async (id: string): Promise<any> => {
  try {
    const url = `${getSupabaseUrl()}/functions/v1/destinations/${id}/restore`;
    
    console.log("Restoring destination:", url);
    
    const result = await fetchWithAuth(url, {
      method: "POST"
    });
    
    return result.destination;
  } catch (error) {
    console.error("Restore destination error:", error);
    handleApiError(error, "Error restoring destination");
  }
};
