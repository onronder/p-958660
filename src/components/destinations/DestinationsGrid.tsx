
import React from "react";
import DestinationCard from "@/components/destinations/DestinationCard";
import { Destination } from "@/hooks/useDestinations";

interface DestinationsGridProps {
  destinations: Destination[];
  onTestConnection: (destination: Destination) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  onRetry: (id: string) => void;
  isTesting: (id: string) => boolean;
  isExporting: (id: string) => boolean;
}

const DestinationsGrid: React.FC<DestinationsGridProps> = ({
  destinations,
  onTestConnection,
  onDelete,
  onExport,
  onRetry,
  isTesting,
  isExporting,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {destinations.map((destination) => (
        <DestinationCard
          key={destination.id}
          destination={destination}
          onTestConnection={() => onTestConnection(destination)}
          onDelete={() => onDelete(destination.id)}
          onExport={() => onExport(destination.id)}
          onRetry={() => onRetry(destination.id)}
          isExporting={isExporting(destination.id)}
          isTesting={isTesting(destination.id)}
        />
      ))}
    </div>
  );
};

export default DestinationsGrid;
