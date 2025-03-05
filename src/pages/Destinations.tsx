
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DestinationCard from "@/components/destinations/DestinationCard";
import AddDestinationModal from "@/components/destinations/AddDestinationModal";
import DestinationsInfoBanner from "@/components/destinations/DestinationsInfoBanner";
import EmptyStateCard from "@/components/EmptyStateCard";
import { Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Type definition for a destination
interface Destination {
  id: string;
  name: string;
  destination_type: string;
  status: "Active" | "Pending" | "Failed";
  export_format: string;
  schedule: string;
  last_export: string | null;
  connection_details: Record<string, any>;
}

const Destinations = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

  // Retry failed export
  const handleRetryExport = (id: string) => {
    exportMutation.mutate(id);
  };

  // Filter destinations by status if a filter is selected
  const filteredDestinations = selectedStatus
    ? data?.filter((dest) => dest.status === selectedStatus)
    : data;

  // Handle adding a new destination
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
      setIsAddModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add destination",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <DestinationsInfoBanner />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">My Destinations</h1>
          <p className="text-muted-foreground mt-1">
            Manage where your processed data will be exported to
          </p>
        </div>
        <Button 
          className="flex items-center gap-2" 
          onClick={() => setIsAddModalOpen(true)}
          disabled={!user}
        >
          <Plus className="h-4 w-4" />
          Add New Destination
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error ? error.message : "Failed to load destinations"}
          </AlertDescription>
        </Alert>
      )}

      {!user && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please log in to manage your destinations.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        <Button
          variant={selectedStatus === null ? "secondary" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus(null)}
        >
          All
        </Button>
        <Button
          variant={selectedStatus === "Active" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("Active")}
        >
          Active
        </Button>
        <Button
          variant={selectedStatus === "Pending" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("Pending")}
        >
          Pending
        </Button>
        <Button
          variant={selectedStatus === "Failed" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setSelectedStatus("Failed")}
        >
          Failed
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                </div>
                <div className="flex justify-between pt-4 border-t border-border">
                  <Skeleton className="h-8 w-1/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : filteredDestinations?.length === 0 ? (
        <EmptyStateCard
          icon={Database}
          title="No destinations configured"
          description="Add your first destination to start exporting processed data to external systems or storage providers."
          actionLabel="Add Destination"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations?.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              onTestConnection={() => testConnectionMutation.mutate(destination)}
              onDelete={() => deleteMutation.mutate(destination.id)}
              onExport={() => exportMutation.mutate(destination.id)}
              onRetry={() => handleRetryExport(destination.id)}
              isExporting={exportMutation.isPending && exportMutation.variables === destination.id}
              isTesting={testConnectionMutation.isPending && testConnectionMutation.variables?.id === destination.id}
            />
          ))}
        </div>
      )}

      <AddDestinationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddDestination}
      />
    </div>
  );
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

export default Destinations;
