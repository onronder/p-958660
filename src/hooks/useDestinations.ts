
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
  status: "Active" | "Pending" | "Failed";
  export_format: string;
  schedule: string;
  last_export: string | null;
  connection_details: Record<string, any>;
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
      
      // Use string concatenation to access the functions URL
      const response = await fetch(`${process.env.SUPABASE_URL || 'https://eovyjotxecnkqjylwdnj.supabase.co'}/functions/v1/destinations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newDestination)
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
      connection_details: destination.connection_details
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
