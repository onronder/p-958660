
import { supabase } from "@/integrations/supabase/client";
import { Destination } from "@/hooks/destinations/types";

// Function to fetch destinations from the API
export async function fetchDestinations() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Authentication required");
  }
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co';
  const response = await fetch(`${supabaseUrl}/functions/v1/destinations`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${session.access_token}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch destinations");
  }
  
  const data = await response.json();
  return data.destinations;
}

// Function to delete a destination
export const deleteDestination = async (id: string): Promise<boolean> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) throw new Error(authError.message);

    const token = authData.session?.access_token;
    if (!token) throw new Error("No access token available");

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/destinations/${id}?soft_delete=true`, {
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
    console.error("Error deleting destination:", error);
    throw error;
  }
};

export const permanentlyDeleteDestination = async (id: string): Promise<boolean> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) throw new Error(authError.message);

    const token = authData.session?.access_token;
    if (!token) throw new Error("No access token available");

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/destinations/${id}?soft_delete=false`, {
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
    console.error("Error permanently deleting destination:", error);
    throw error;
  }
};

export const restoreDestination = async (id: string): Promise<any> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) throw new Error(authError.message);

    const token = authData.session?.access_token;
    if (!token) throw new Error("No access token available");

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/destinations/${id}/restore`, {
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
    console.error("Error restoring destination:", error);
    throw error;
  }
};

// Function to test a destination connection
export async function testConnection(destination: Destination) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Authentication required");
  }
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co';
  const response = await fetch(`${supabaseUrl}/functions/v1/test-destination-connection`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
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
}

// Function to export data to a destination
export async function exportToDestination(destinationId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Authentication required");
  }
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co';
  const response = await fetch(`${supabaseUrl}/functions/v1/export-to-destination`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    },
    body: JSON.stringify({
      destination_id: destinationId
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || "Failed to start export");
  }
  
  return data;
}

// Function to add a new destination
export async function addDestination(newDestination: any) {
  console.log("API: Adding destination:", newDestination);
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Authentication required");
  }
  
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
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co';
  const response = await fetch(`${supabaseUrl}/functions/v1/destinations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
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
}

// Function to update an existing destination
export async function updateDestination(destination: any) {
  console.log("API: Updating destination:", destination);
  
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Authentication required");
  }
  
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
  
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co';
  const response = await fetch(`${supabaseUrl}/functions/v1/destinations/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${session.access_token}`
    },
    body: JSON.stringify(transformedDestination)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update destination");
  }
  
  const responseData = await response.json();
  console.log("API: Response after updating destination:", responseData);
  
  return responseData.destination;
}
