
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
  onExport: (id: string) => void;
  onRetry: (id: string) => void;
  isTesting: (id: string) => boolean;
  isExporting: (id: string) => boolean;
  onAddClick: () => void;
}

const DestinationsList: React.FC<DestinationsListProps> = ({
  destinations,
  isLoading,
  onTestConnection,
  onDelete,
  onExport,
  onRetry,
  isTesting,
  isExporting,
  onAddClick,
}) => {
  if (isLoading) {
    return <DestinationsListSkeleton />;
  }

  if (!destinations || destinations.length === 0) {
    return <EmptyDestinations onAddClick={onAddClick} />;
  }

  return (
    <DestinationsGrid
      destinations={destinations}
      onTestConnection={onTestConnection}
      onDelete={onDelete}
      onExport={onExport}
      onRetry={onRetry}
      isTesting={isTesting}
      isExporting={isExporting}
    />
  );
};

export default DestinationsList;
