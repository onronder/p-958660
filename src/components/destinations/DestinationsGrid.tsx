
import React from "react";
import DestinationCard from "@/components/destinations/DestinationCard";
import { Destination } from "@/hooks/destinations/types";

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
  if (!Array.isArray(destinations)) {
    console.error('DestinationsGrid: destinations is not an array');
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Unable to display destinations. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {destinations.map((destination) => (
        destination && destination.id ? (
          <DestinationCard
            key={destination.id}
            destination={{
              id: destination.id,
              name: destination.name,
              destination_type: destination.destination_type,
              status: destination.status as "Active" | "Pending" | "Failed",
              export_format: destination.export_format,
              schedule: destination.schedule,
              last_export: destination.last_export ? destination.last_export.toString() : null
            }}
            onTestConnection={() => onTestConnection(destination)}
            onDelete={() => onDelete(destination.id)}
            onExport={() => onExport(destination.id)}
            onRetry={() => onRetry(destination.id)}
            isExporting={isExporting(destination.id)}
            isTesting={isTesting(destination.id)}
          />
        ) : null
      ))}
    </div>
  );
};

export default DestinationsGrid;
