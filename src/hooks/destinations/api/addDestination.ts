
import { getSupabaseUrl, handleApiError, fetchWithAuth } from "./apiUtils";

// Function to add a new destination
export async function addDestination(newDestination: any) {
  try {
    console.log("API: Adding destination:", newDestination);
    
    // Get storage type from destination type
    let storageType = newDestination.storageType;
    
    // If not already set, derive it from the type field
    if (!storageType) {
      storageType = newDestination.type === 'Google Drive' ? 'google_drive' :
                    newDestination.type === 'Microsoft OneDrive' ? 'onedrive' :
                    newDestination.type === 'AWS S3' ? 'aws_s3' :
                    newDestination.type === 'FTP/SFTP' ? 'ftp_sftp' :
                    'custom_api';
    }
    
    // For SFTP/FTP connections, use the protocol as the storage_type if available
    if (storageType === 'ftp_sftp' && newDestination.credentials?.protocol) {
      storageType = newDestination.credentials.protocol;
    }
    
    // Transform the destination data to match the schema
    const transformedDestination = {
      name: newDestination.name,
      destination_type: newDestination.type, // Keep for backwards compatibility
      storage_type: storageType,
      status: "Pending",
      export_format: newDestination.exportFormat,
      schedule: newDestination.schedule,
      config: newDestination.credentials || {},
      save_to_storage: newDestination.save_to_storage
    };
    
    console.log("API: Transformed destination:", transformedDestination);
    
    const url = `${getSupabaseUrl()}/functions/v1/destinations`;
    const responseData = await fetchWithAuth(url, {
      method: "POST",
      body: JSON.stringify(transformedDestination)
    });
    
    console.log("API: Response after adding destination:", responseData);
    
    return responseData;
  } catch (error) {
    console.error("Add destination error:", error);
    handleApiError(error, "Failed to add destination");
  }
}
