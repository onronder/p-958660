
import React from "react";
import { Database } from "lucide-react";
import EmptyStateCard from "@/components/EmptyStateCard";

interface EmptyDestinationsProps {
  onAddClick: () => void;
}

const EmptyDestinations: React.FC<EmptyDestinationsProps> = ({ onAddClick }) => {
  return (
    <EmptyStateCard
      icon={Database}
      title="No destinations configured"
      description="Add your first destination to start exporting processed data to external systems or storage providers."
      actionLabel="Add Destination"
      onAction={onAddClick}
    />
  );
};

export default EmptyDestinations;
