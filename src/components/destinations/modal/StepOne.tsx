
import React from "react";
import { Label } from "@/components/ui/label";
import DestinationTypeButton from "./DestinationTypeButton";

interface StepOneProps {
  destinationType: string;
  setDestinationType: (type: string) => void;
  isEditMode?: boolean;
}

const StepOne: React.FC<StepOneProps> = ({ 
  destinationType, 
  setDestinationType,
  isEditMode = false
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>Destination Type</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DestinationTypeButton 
            type="Google Drive" 
            selected={destinationType === "Google Drive"} 
            onClick={() => setDestinationType("Google Drive")} 
            disabled={true}
            icon="drive"
          />
          
          <DestinationTypeButton 
            type="Microsoft OneDrive" 
            selected={destinationType === "Microsoft OneDrive"} 
            onClick={() => setDestinationType("Microsoft OneDrive")} 
            disabled={true}
            icon="onedrive"
          />
          
          <DestinationTypeButton 
            type="AWS S3" 
            selected={destinationType === "AWS S3"} 
            onClick={() => setDestinationType("AWS S3")} 
            disabled={true}
            isComingSoon={true}
            icon="aws"
          />
          
          <DestinationTypeButton 
            type="Custom API" 
            selected={destinationType === "Custom API"} 
            onClick={() => setDestinationType("Custom API")} 
            disabled={true}
            isComingSoon={true}
            icon="api"
          />
          
          <DestinationTypeButton 
            type="FTP/SFTP" 
            selected={destinationType === "FTP/SFTP"} 
            onClick={() => setDestinationType("FTP/SFTP")} 
            disabled={false}
            icon="ftp"
          />
        </div>
      </div>
    </div>
  );
};

export default StepOne;
