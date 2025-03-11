
import React from "react";
import { Card } from "@/components/ui/card";
import DestinationHeader from "./DestinationHeader";
import DestinationDetails from "./DestinationDetails";
import DestinationActions from "./DestinationActions";

interface DestinationProps {
  destination: {
    id: string;
    name: string;
    destination_type: string;
    status: "Active" | "Pending" | "Failed" | "Deleted";
    export_format: string;
    schedule: string;
    last_export: string | null;
  };
  onTestConnection: () => void;
  onDelete: () => void;
  onEdit: () => void;
  onExport: () => void;
  onRetry: () => void;
  isExporting?: boolean;
  isTesting?: boolean;
}

const DestinationCard: React.FC<DestinationProps> = ({ 
  destination, 
  onTestConnection, 
  onDelete,
  onEdit,
  onExport,
  onRetry,
  isExporting = false,
  isTesting = false
}) => {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <DestinationHeader 
          name={destination.name}
          destinationType={destination.destination_type}
          status={destination.status}
        />
        
        <DestinationDetails destination={destination} />
      </div>
      
      <DestinationActions 
        id={destination.id}
        name={destination.name}
        status={destination.status}
        onTestConnection={onTestConnection}
        onDelete={onDelete}
        onEdit={onEdit}
        onExport={onExport}
        onRetry={onRetry}
        isExporting={isExporting}
        isTesting={isTesting}
      />
    </Card>
  );
};

export default DestinationCard;
