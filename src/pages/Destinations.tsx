
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDestinations } from "@/hooks/useDestinations";
import AddDestinationModal from "@/components/destinations/AddDestinationModal";
import DestinationsInfoBanner from "@/components/destinations/DestinationsInfoBanner";
import DestinationsHeader from "@/components/destinations/DestinationsHeader";
import DestinationsStatusFilter from "@/components/destinations/DestinationsStatusFilter";
import DestinationsErrorDisplay from "@/components/destinations/DestinationsErrorDisplay";
import DestinationsList from "@/components/destinations/DestinationsList";

const Destinations = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { user } = useAuth();
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
  } = useDestinations();

  // Handle adding a new destination
  const onAddDestination = async (newDestination: any) => {
    const success = await handleAddDestination(newDestination);
    if (success) {
      setIsAddModalOpen(false);
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
