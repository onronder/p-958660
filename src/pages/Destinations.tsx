
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  const { user } = useAuth();
  const location = useLocation();
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

  // Handle adding a new destination
  const onAddDestination = async (newDestination: any) => {
    console.log("Adding new destination:", newDestination);
    const success = await handleAddDestination(newDestination);
    if (success) {
      setIsAddModalOpen(false);
      toast({
        title: "Destination Added",
        description: `${newDestination.name} has been added to your destinations.`,
      });
    }
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
        onAddClick={() => setIsAddModalOpen(true)} 
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
        onDelete={(id) => deleteMutation.mutate(id)}
        onExport={(id) => exportMutation.mutate(id)}
        onRetry={handleRetryExport}
        isTesting={isTesting}
        isExporting={isExporting}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      <AddDestinationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddDestination}
      />
    </div>
  );
};

export default Destinations;
