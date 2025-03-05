
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DestinationsHeaderProps {
  onAddClick: () => void;
  isUserLoggedIn: boolean;
}

const DestinationsHeader: React.FC<DestinationsHeaderProps> = ({ 
  onAddClick, 
  isUserLoggedIn 
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-primary">My Destinations</h1>
        <p className="text-muted-foreground mt-1">
          Manage where your processed data will be exported to
        </p>
      </div>
      <Button 
        className="flex items-center gap-2" 
        onClick={onAddClick}
        disabled={!isUserLoggedIn}
      >
        <Plus className="h-4 w-4" />
        Add New Destination
      </Button>
    </div>
  );
};

export default DestinationsHeader;
