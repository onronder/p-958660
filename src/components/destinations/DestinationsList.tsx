
import React from "react";
import { Destination } from "@/hooks/useDestinations";
import DestinationsListSkeleton from "./DestinationsListSkeleton";
import EmptyDestinations from "./EmptyDestinations";
import DestinationsGrid from "./DestinationsGrid";

interface DestinationsListProps {
  destinations: Destination[] | undefined;
  isLoading: boolean;
  onTestConnection: (destination: Destination) => void;
  onDelete: (id: string) => void;
  onEdit: (destination: Destination) => void;
  onExport: (id: string) => void;
  onRetry: (id: string) => void;
  onRestore?: (id: string) => void;
  isTesting: (id: string) => boolean;
  isExporting: (id: string) => boolean;
  onAddClick: () => void;
}

const DestinationsList: React.FC<DestinationsListProps> = ({
  destinations,
  isLoading,
  onTestConnection,
  onDelete,
  onEdit,
  onExport,
  onRetry,
  onRestore,
  isTesting,
  isExporting,
  onAddClick,
}) => {
  // Return loading skeleton while data is being fetched
  if (isLoading) {
    return <DestinationsListSkeleton />;
  }

  // Handle case where destinations is undefined or empty
  if (!destinations || destinations.length === 0) {
    // Make sure onAddClick is a function before rendering EmptyDestinations
    if (typeof onAddClick === 'function') {
      return <EmptyDestinations onAddClick={onAddClick} />;
    }
    // If onAddClick is not a function, just show a basic message
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No destinations available.</p>
      </div>
    );
  }

  // Make sure all the handler functions exist before rendering DestinationsGrid
  if (
    typeof onTestConnection !== 'function' ||
    typeof onDelete !== 'function' ||
    typeof onEdit !== 'function' ||
    typeof onExport !== 'function' ||
    typeof onRetry !== 'function' ||
    typeof isTesting !== 'function' ||
    typeof isExporting !== 'function'
  ) {
    console.error('DestinationsList: One or more required handlers is not a function');
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Unable to display destinations. Please try again later.</p>
      </div>
    );
  }

  // If we have destinations and all handlers are functions, render the grid
  return (
    <DestinationsGrid
      destinations={destinations}
      onTestConnection={onTestConnection}
      onDelete={onDelete}
      onEdit={onEdit}
      onExport={onExport}
      onRetry={onRetry}
      onRestore={onRestore}
      isTesting={isTesting}
      isExporting={isExporting}
    />
  );
};

export default DestinationsList;
