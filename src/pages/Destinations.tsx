
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDestinations } from "@/hooks/useDestinations";
import AddDestinationModal from "@/components/destinations/AddDestinationModal";
import DestinationsInfoBanner from "@/components/destinations/DestinationsInfoBanner";
import DestinationsHeader from "@/components/destinations/DestinationsHeader";
import DestinationsStatusFilter from "@/components/destinations/DestinationsStatusFilter";
import DestinationsErrorDisplay from "@/components/destinations/DestinationsErrorDisplay";
import DestinationsList from "@/components/destinations/DestinationsList";
import { useToast } from "@/hooks/use-toast";

const Destinations = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<any>(null);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    filteredDestinations,
    isLoading,
    error,
    selectedStatus,
    setSelectedStatus,
    deleteMutation,
    testConnectionMutation,
    exportMutation,
    handleAddDestination,
    handleUpdateDestination,
    handleRestoreDestination,
    handleRetryExport,
    handleOAuthCallback
  } = useDestinations();

  // Handle OAuth callback data if it exists in the URL state
  useEffect(() => {
    if (location.state?.oauth) {
      const { code, provider } = location.state.oauth;
      
      if (code && provider) {
        console.log("Received OAuth callback from URL state:", { code, provider });
        const redirectUri = `${window.location.origin}/auth/callback`;
        
        handleOAuthCallback(provider, code, redirectUri)
          .then(() => {
            toast({
              title: "Authentication Successful",
              description: `Successfully connected to ${provider === 'google_drive' ? 'Google Drive' : 'Microsoft OneDrive'}`,
            });
            // Clear the state after processing
            window.history.replaceState({}, document.title, location.pathname);
          })
          .catch((error) => {
            toast({
              title: "Authentication Error",
              description: error.message || `Failed to complete ${provider} authentication`,
              variant: "destructive",
            });
          });
      }
    }
  }, [location.state, handleOAuthCallback, toast]);

  // Handle edit destination
  const handleEditDestination = (destination: any) => {
    setEditingDestination(destination);
    setIsAddModalOpen(true);
  };

  // Handle adding or updating a destination
  const onAddOrUpdateDestination = async (newDestination: any) => {
    if (editingDestination) {
      // Update existing destination
      const success = await handleUpdateDestination({
        ...newDestination,
        id: editingDestination.id
      });
      
      if (success) {
        setIsAddModalOpen(false);
        setEditingDestination(null);
        toast({
          title: "Destination Updated",
          description: `${newDestination.name} has been updated.`,
        });
      }
    } else {
      // Add new destination
      const success = await handleAddDestination(newDestination);
      if (success) {
        setIsAddModalOpen(false);
        toast({
          title: "Destination Added",
          description: `${newDestination.name} has been added to your destinations.`,
        });
      }
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsAddModalOpen(false);
    setEditingDestination(null);
  };

  // Check if a destination is currently being tested
  const isTesting = (destinationId: string) => {
    return testConnectionMutation.isPending && 
           testConnectionMutation.variables?.id === destinationId;
  };

  // Check if a destination is currently being exported
  const isExporting = (destinationId: string) => {
    return exportMutation.isPending && 
           exportMutation.variables === destinationId;
  };

  return (
    <div className="space-y-8">
      <DestinationsInfoBanner />

      <DestinationsHeader 
        onAddClick={() => {
          setEditingDestination(null);
          setIsAddModalOpen(true);
        }} 
        isUserLoggedIn={!!user}
      />

      <DestinationsErrorDisplay 
        error={error instanceof Error ? error : null} 
        isUserLoggedIn={!!user}
      />

      <DestinationsStatusFilter
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <DestinationsList
        destinations={filteredDestinations}
        isLoading={isLoading}
        onTestConnection={(destination) => testConnectionMutation.mutate(destination)}
        onDelete={(id) => {
          const destination = filteredDestinations?.find(d => d.id === id);
          if (destination?.status === "Deleted") {
            // Permanently delete
            deleteMutation.mutate({id, permanent: true});
          } else {
            // Temporary delete
            deleteMutation.mutate({id, permanent: false});
          }
        }}
        onEdit={(destination) => handleEditDestination(destination)}
        onExport={(id) => exportMutation.mutate(id)}
        onRetry={handleRetryExport}
        onRestore={(id) => handleRestoreDestination(id)}
        isTesting={isTesting}
        isExporting={isExporting}
        onAddClick={() => {
          setEditingDestination(null);
          setIsAddModalOpen(true);
        }}
      />

      <AddDestinationModal
        isOpen={isAddModalOpen}
        onClose={handleModalClose}
        onAdd={onAddOrUpdateDestination}
        editDestination={editingDestination}
      />
    </div>
  );
};

export default Destinations;
