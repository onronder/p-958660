
import { getSupabaseUrl, handleApiError, fetchWithAuth } from "./apiUtils";

// Function to update an existing destination
export async function updateDestination(destination: any) {
  try {
    console.log("API: Updating destination:", destination);
    
    // Extract ID and remove it from the payload
    const id = destination.id;
    if (!id) {
      throw new Error("Destination ID is required for update");
    }
    
    // Get storage type from destination type
    let storageType = destination.storageType;
    
    // If not already set, derive it from the type field
    if (!storageType) {
      storageType = destination.type === 'Google Drive' ? 'google_drive' :
                    destination.type === 'Microsoft OneDrive' ? 'onedrive' :
                    destination.type === 'AWS S3' ? 'aws_s3' :
                    destination.type === 'FTP/SFTP' ? 'ftp_sftp' :
                    'custom_api';
    }
    
    // For SFTP/FTP connections, use the protocol as the storage_type if available
    if (storageType === 'ftp_sftp' && destination.credentials?.protocol) {
      storageType = destination.credentials.protocol;
    }
    
    // Transform the destination data to match the schema
    const transformedDestination = {
      name: destination.name,
      destination_type: destination.type, // Keep for backwards compatibility
      storage_type: storageType,
      export_format: destination.exportFormat,
      schedule: destination.schedule || "Manual",
      config: destination.credentials || {},
      save_to_storage: destination.save_to_storage
    };
    
    console.log("API: Transformed destination for update:", transformedDestination);
    
    const url = `${getSupabaseUrl()}/functions/v1/destinations/${id}`;
    const responseData = await fetchWithAuth(url, {
      method: "PATCH",
      body: JSON.stringify(transformedDestination)
    });
    
    console.log("API: Response after updating destination:", responseData);
    
    return responseData.destination;
  } catch (error) {
    console.error("Update destination error:", error);
    handleApiError(error, "Failed to update destination");
  }
}
