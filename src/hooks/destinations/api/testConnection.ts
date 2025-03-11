
import { Destination } from "@/hooks/destinations/types";
import { getAuthToken, getSupabaseUrl, handleApiError } from "./apiUtils";

// Function to test a destination connection
export async function testConnection(destination: Destination) {
  try {
    const token = await getAuthToken();
    const supabaseUrl = getSupabaseUrl();
    
    const response = await fetch(`${supabaseUrl}/functions/v1/test-destination-connection`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        destination_type: destination.destination_type,
        storage_type: destination.storage_type,
        connection_details: destination.config
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || "Connection test failed");
    }
    
    return data;
  } catch (error) {
    handleApiError(error, "Connection test failed");
  }
}
