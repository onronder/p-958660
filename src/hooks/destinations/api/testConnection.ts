
import { Destination } from "@/hooks/destinations/types";
import { getSupabaseUrl, handleApiError, fetchWithAuth } from "./apiUtils";

// Function to test a destination connection
export async function testConnection(destination: Destination) {
  try {
    const url = `${getSupabaseUrl()}/functions/v1/test-destination-connection`;
    
    console.log("Testing connection for destination:", destination.name);
    
    // Ensure all required properties are present
    if (!destination.destination_type || !destination.storage_type) {
      throw new Error("Missing required properties for connection test");
    }
    
    const payload = {
      destination_type: destination.destination_type,
      storage_type: destination.storage_type,
      connection_details: destination.config || {}
    };
    
    console.log("Test connection payload:", payload);
    
    const data = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    
    return data;
  } catch (error) {
    console.error("Connection test error:", error);
    handleApiError(error, "Connection test failed");
    throw error; // Re-throw to be handled by the calling component
  }
}
