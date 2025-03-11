
import React from "react";
import { Label } from "@/components/ui/label";
import DestinationTypeButton from "./DestinationTypeButton";

interface StepOneProps {
  selectedDestinationType: string;
  onDestinationTypeChange: (type: string) => void;
}

const StepOne: React.FC<StepOneProps> = ({ 
  selectedDestinationType, 
  onDestinationTypeChange 
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Destination Type</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DestinationTypeButton 
            type="Google Drive" 
            selected={selectedDestinationType === "Google Drive"} 
            onClick={() => onDestinationTypeChange("Google Drive")} 
            disabled={true}
            icon="drive"
          />
          
          <DestinationTypeButton 
            type="Microsoft OneDrive" 
            selected={selectedDestinationType === "Microsoft OneDrive"} 
            onClick={() => onDestinationTypeChange("Microsoft OneDrive")} 
            disabled={true}
            icon="onedrive"
          />
          
          <DestinationTypeButton 
            type="AWS S3" 
            selected={selectedDestinationType === "AWS S3"} 
            onClick={() => onDestinationTypeChange("AWS S3")} 
            disabled={true}
            isComingSoon={true}
            icon="aws"
          />
          
          <DestinationTypeButton 
            type="Custom API" 
            selected={selectedDestinationType === "Custom API"} 
            onClick={() => onDestinationTypeChange("Custom API")} 
            disabled={true}
            isComingSoon={true}
            icon="api"
          />
          
          <DestinationTypeButton 
            type="FTP/SFTP" 
            selected={selectedDestinationType === "FTP/SFTP"} 
            onClick={() => onDestinationTypeChange("FTP/SFTP")} 
            disabled={false}
            icon="ftp"
          />
        </div>
      </div>
    </div>
  );
};

export default StepOne;
