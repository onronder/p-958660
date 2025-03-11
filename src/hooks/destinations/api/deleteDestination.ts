
import { getAuthToken, getSupabaseUrl, handleApiError } from "./apiUtils";

// Function to delete a destination
export const deleteDestination = async (id: string): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${getSupabaseUrl()}/functions/v1/destinations/${id}?soft_delete=true`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Failed to delete destination"
      );
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    handleApiError(error, "Error deleting destination");
  }
};

export const permanentlyDeleteDestination = async (id: string): Promise<boolean> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${getSupabaseUrl()}/functions/v1/destinations/${id}?soft_delete=false`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Failed to permanently delete destination"
      );
    }

    const result = await response.json();
    return result.success;
  } catch (error) {
    handleApiError(error, "Error permanently deleting destination");
  }
};
