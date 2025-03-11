
import { getAuthToken, getSupabaseUrl, handleApiError } from "./apiUtils";

// Function to delete a destination
export const deleteDestination = async (id: string): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    const url = `${getSupabaseUrl()}/functions/v1/destinations/${id}?soft_delete=true`;
    
    // Add console.log to debug request
    console.log("Deleting destination:", url);
    
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Delete destination error status:", response.status);
      const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
      throw new Error(
        errorData.error || "Failed to delete destination"
      );
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Delete destination error:", error);
    handleApiError(error, "Error deleting destination");
    throw error; // Re-throw the error to be handled by the calling component
  }
};

export const permanentlyDeleteDestination = async (id: string): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    const url = `${getSupabaseUrl()}/functions/v1/destinations/${id}?soft_delete=false`;
    
    // Add console.log to debug request
    console.log("Permanently deleting destination:", url);
    
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("Permanently delete destination error status:", response.status);
      const errorData = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
      throw new Error(
        errorData.error || "Failed to permanently delete destination"
      );
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Permanently delete destination error:", error);
    handleApiError(error, "Error permanently deleting destination");
    throw error; // Re-throw the error to be handled by the calling component
  }
};
