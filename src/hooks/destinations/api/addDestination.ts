
import { getAuthToken, getSupabaseUrl, handleApiError } from "./apiUtils";

// Function to add a new destination
export async function addDestination(newDestination: any) {
  try {
    console.log("API: Adding destination:", newDestination);
    
    const token = await getAuthToken();
    
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
    
    const supabaseUrl = getSupabaseUrl();
    const response = await fetch(`${supabaseUrl}/functions/v1/destinations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(transformedDestination)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to add destination");
    }
    
    const responseData = await response.json();
    console.log("API: Response after adding destination:", responseData);
    
    return responseData;
  } catch (error) {
    handleApiError(error, "Failed to add destination");
  }
}
