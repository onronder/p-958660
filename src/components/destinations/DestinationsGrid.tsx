
import React from "react";
import DestinationCard from "@/components/destinations/DestinationCard";
import { Destination } from "@/hooks/destinations/types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DestinationsGridProps {
  destinations: Destination[];
  onTestConnection: (destination: Destination) => void;
  onDelete: (id: string) => void;
  onEdit: (destination: Destination) => void;
  onExport: (id: string) => void;
  onRetry: (id: string) => void;
  onRestore?: (id: string) => void;
  isTesting: (id: string) => boolean;
  isExporting: (id: string) => boolean;
}

const DestinationsGrid: React.FC<DestinationsGridProps> = ({
  destinations,
  onTestConnection,
  onDelete,
  onEdit,
  onExport,
  onRetry,
  onRestore,
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
          <div key={destination.id} className="relative">
            {destination.status === "Deleted" && onRestore && (
              <div className="absolute -top-3 -right-3 z-10">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-white dark:bg-gray-800 flex items-center text-xs px-2 py-1 h-auto border-blue-500 text-blue-600"
                  onClick={() => onRestore(destination.id)}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Restore
                </Button>
              </div>
            )}
            <DestinationCard
              destination={destination}
              onTestConnection={() => onTestConnection(destination)}
              onDelete={() => onDelete(destination.id)}
              onEdit={() => onEdit(destination)}
              onExport={() => onExport(destination.id)}
              onRetry={() => onRetry(destination.id)}
              isExporting={isExporting(destination.id)}
              isTesting={isTesting(destination.id)}
            />
          </div>
        ) : null
      ))}
    </div>
  );
};

export default DestinationsGrid;
