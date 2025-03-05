
import React from "react";
import { Database } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import DestinationCard from "@/components/destinations/DestinationCard";
import EmptyStateCard from "@/components/EmptyStateCard";
import { Destination } from "@/hooks/useDestinations";

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
    return (
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
    );
  }

  if (!destinations || destinations.length === 0) {
    return (
      <EmptyStateCard
        icon={Database}
        title="No destinations configured"
        description="Add your first destination to start exporting processed data to external systems or storage providers."
        actionLabel="Add Destination"
        onAction={onAddClick}
      />
    );
  }

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

export default DestinationsList;
