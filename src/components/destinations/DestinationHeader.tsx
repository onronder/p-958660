
import React from "react";
import StatusBadge from "./StatusBadge";

interface DestinationHeaderProps {
  name: string;
  destinationType: string;
  status: "Active" | "Pending" | "Failed";
}

const DestinationHeader: React.FC<DestinationHeaderProps> = ({ 
  name, 
  destinationType, 
  status 
}) => {
  return (
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">{name}</h3>
          <StatusBadge status={status} />
        </div>
        <p className="text-sm text-muted-foreground mt-1">{destinationType}</p>
      </div>
    </div>
  );
};

export default DestinationHeader;
