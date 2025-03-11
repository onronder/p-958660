
import { getSupabaseUrl, handleApiError, fetchWithAuth } from "./apiUtils";

// Function to delete a destination
export const deleteDestination = async (id: string): Promise<boolean> => {
  try {
    const url = `${getSupabaseUrl()}/functions/v1/destinations/${id}?soft_delete=true`;
    
    // Add console.log to debug request
    console.log("Deleting destination:", url);
    
    const result = await fetchWithAuth(url, {
      method: "DELETE"
    });

    return result.success;
  } catch (error) {
    console.error("Delete destination error:", error);
    handleApiError(error, "Error deleting destination");
    throw error; // Re-throw the error to be handled by the calling component
  }
};

export const permanentlyDeleteDestination = async (id: string): Promise<boolean> => {
  try {
    const url = `${getSupabaseUrl()}/functions/v1/destinations/${id}?soft_delete=false`;
    
    // Add console.log to debug request
    console.log("Permanently deleting destination:", url);
    
    const result = await fetchWithAuth(url, {
      method: "DELETE"
    });

    return result.success;
  } catch (error) {
    console.error("Permanently delete destination error:", error);
    handleApiError(error, "Error permanently deleting destination");
    throw error; // Re-throw the error to be handled by the calling component
  }
};
