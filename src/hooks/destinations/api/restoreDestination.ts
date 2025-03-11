
import { getAuthToken, getSupabaseUrl, handleApiError } from "./apiUtils";

export const restoreDestination = async (id: string): Promise<any> => {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${getSupabaseUrl()}/functions/v1/destinations/${id}/restore`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || "Failed to restore destination"
      );
    }

    const result = await response.json();
    return result.destination;
  } catch (error) {
    handleApiError(error, "Error restoring destination");
  }
};
