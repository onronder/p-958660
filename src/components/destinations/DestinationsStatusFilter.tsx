
import React from "react";
import { Button } from "@/components/ui/button";

interface DestinationsStatusFilterProps {
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
}

const DestinationsStatusFilter: React.FC<DestinationsStatusFilterProps> = ({
  selectedStatus,
  onStatusChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button
        variant={selectedStatus === null ? "secondary" : "outline"}
        size="sm"
        onClick={() => onStatusChange(null)}
      >
        All
      </Button>
      <Button
        variant={selectedStatus === "Active" ? "secondary" : "outline"}
        size="sm"
        onClick={() => onStatusChange("Active")}
      >
        Active
      </Button>
      <Button
        variant={selectedStatus === "Pending" ? "secondary" : "outline"}
        size="sm"
        onClick={() => onStatusChange("Pending")}
      >
        Pending
      </Button>
      <Button
        variant={selectedStatus === "Failed" ? "secondary" : "outline"}
        size="sm"
        onClick={() => onStatusChange("Failed")}
      >
        Failed
      </Button>
    </div>
  );
};

export default DestinationsStatusFilter;
