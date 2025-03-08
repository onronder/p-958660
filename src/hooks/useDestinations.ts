
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Type definition for a destination
export interface Destination {
  id: string;
  name: string;
  destination_type: string;
  storage_type: string;
  status: "Active" | "Pending" | "Failed";
  export_format: string;
  schedule: string;
  last_export: string | null;
  config: Record<string, any>;
}

export const useDestinations = () => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch destinations
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["destinations"],
    queryFn: fetchDestinations,
    enabled: !!user, // Only run if user is logged in
    refetchInterval: 30000, // Polling every 30 seconds to refresh statuses
  });

  // Delete destination mutation
  const deleteMutation = useMutation({
    mutationFn: deleteDestination,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      toast({
        title: "Destination deleted",
        description: "The destination has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete destination.",
        variant: "destructive",
      });
    },
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: testConnection,
    onSuccess: (data) => {
      toast({
        title: "Connection test successful",
        description: data.message || "The destination connection is working properly.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Connection test failed",
        description: error.message || "Failed to connect to destination.",
        variant: "destructive",
      });
    },
  });

  // Export data mutation
  const exportMutation = useMutation({
    mutationFn: exportToDestination,
    onSuccess: (data) => {
      toast({
        title: "Export started",
        description: "The export process has been started. You'll be notified when it completes.",
      });
      // Refetch after a few seconds to see status update
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["destinations"] }), 5000);
    },
    onError: (error: Error) => {
      toast({
        title: "Export failed",
        description: error.message || "Failed to start export process.",
        variant: "destructive",
      });
    },
  });

  // OAuth flow for Google Drive and OneDrive
  const initiateOAuth = async (provider: 'google_drive' | 'onedrive', redirectUri: string) => {
    try {
      const clientId = provider === 'google_drive' 
        ? process.env.GOOGLE_CLIENT_ID 
        : process.env.MICROSOFT_CLIENT_ID;
      
      if (!clientId) {
        throw new Error(`${provider} client ID not configured`);
      }
      
      // Configure OAuth URL based on provider
      let authUrl = '';
      if (provider === 'google_drive') {
        authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'https://www.googleapis.com/auth/drive.file',
          access_type: 'offline',
          prompt: 'consent'
        });
        authUrl = `${authUrl}?${params.toString()}`;
      } else { // onedrive
        authUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: 'files.readwrite.all offline_access',
        });
        authUrl = `${authUrl}?${params.toString()}`;
      }
      
      // Open the OAuth window
      window.open(authUrl, '_blank', 'width=800,height=600');
      
      // Return the auth URL in case it's needed
      return { url: authUrl };
    } catch (error) {
      console.error(`Error initiating ${provider} OAuth:`, error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : `Failed to start ${provider} authentication`,
        variant: "destructive",
      });
      return { error };
    }
  };

  // Handle OAuth callback (called when the OAuth flow is complete)
  const handleOAuthCallback = async (provider: 'google_drive' | 'onedrive', code: string, redirectUri: string) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        throw new Error("Authentication required");
      }
      
      const response = await fetch(`${process.env.SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co'}/functions/v1/oauth-callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ provider, code, redirectUri })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to complete ${provider} authentication`);
      }
      
      const data = await response.json();
      
      toast({
        title: "Authentication Successful",
        description: `Successfully connected to ${provider === 'google_drive' ? 'Google Drive' : 'Microsoft OneDrive'}`,
      });
      
      return data;
    } catch (error) {
      console.error(`Error handling ${provider} OAuth callback:`, error);
      toast({
        title: "Authentication Error",
        description: error instanceof Error ? error.message : `Failed to complete ${provider} authentication`,
        variant: "destructive",
      });
      throw error;
    }
  };

  // Filter destinations by status if a filter is selected
  const filteredDestinations = selectedStatus
    ? data?.filter((dest) => dest.status === selectedStatus)
    : data;

  // Add a new destination
  const handleAddDestination = async (newDestination: any) => {
    try {
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;
      
      if (!token) {
        throw new Error("Authentication required");
      }
      
      // Transform the destination data to match the new schema
      const transformedDestination = {
        name: newDestination.name,
        destination_type: newDestination.type, // Keep for backwards compatibility
        storage_type: newDestination.type === 'Google Drive' ? 'google_drive' :
                      newDestination.type === 'Microsoft OneDrive' ? 'onedrive' :
                      newDestination.type === 'AWS S3' ? 'aws_s3' :
                      newDestination.type === 'FTP/SFTP' ? 'ftp_sftp' :
                      'custom_api',
        status: "Pending",
        export_format: newDestination.exportFormat,
        schedule: newDestination.schedule,
        config: newDestination.credentials || {}
      };
      
      // Use string concatenation to access the functions URL
      const response = await fetch(`${process.env.SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co'}/functions/v1/destinations`, {
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
      
      toast({
        title: "Destination added",
        description: `${newDestination.name} has been added successfully.`,
      });
      
      queryClient.invalidateQueries({ queryKey: ["destinations"] });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add destination",
        variant: "destructive",
      });
      return false;
    }
  };

  // Retry failed export
  const handleRetryExport = (id: string) => {
    exportMutation.mutate(id);
  };

  return {
    destinations: data,
    filteredDestinations,
    isLoading,
    error,
    selectedStatus,
    setSelectedStatus,
    deleteMutation,
    testConnectionMutation,
    exportMutation,
    handleAddDestination,
    handleRetryExport,
    initiateOAuth,
    handleOAuthCallback
  };
};

// Function to fetch destinations from the API
async function fetchDestinations() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Authentication required");
  }
  
  // Use string concatenation to access the functions URL
  const response = await fetch(`${process.env.SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co'}/functions/v1/destinations`, {
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
async function deleteDestination(id: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Authentication required");
  }
  
  // Use string concatenation to access the functions URL
  const response = await fetch(`${process.env.SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co'}/functions/v1/destinations/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${session.access_token}`
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete destination");
  }
  
  return true;
}

// Function to test a destination connection
async function testConnection(destination: Destination) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Authentication required");
  }
  
  // Use string concatenation to access the functions URL
  const response = await fetch(`${process.env.SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co'}/functions/v1/test-destination-connection`, {
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
async function exportToDestination(destinationId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Authentication required");
  }
  
  // Use string concatenation to access the functions URL
  const response = await fetch(`${process.env.SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co'}/functions/v1/export-to-destination`, {
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
