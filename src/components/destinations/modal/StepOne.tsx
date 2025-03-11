
import React from "react";
import DestinationTypeButton from "./DestinationTypeButton";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      <p className="text-sm text-muted-foreground mb-4">
        {isEditMode ? 
          "You cannot change the destination type once it has been created." :
          "Choose where you want to export your data to."}
      </p>
      
      <ScrollArea className="h-[320px] pr-4">
        <div className="grid grid-cols-1 gap-4">
          <DestinationTypeButton
            type="FTP/SFTP"
            description="Export to FTP or SFTP server"
            icon="Server"
            selected={destinationType === "FTP/SFTP"}
            onClick={() => setDestinationType("FTP/SFTP")}
            disabled={isEditMode && destinationType !== "FTP/SFTP"}
          />
          
          <DestinationTypeButton
            type="AWS S3"
            description="Export to Amazon S3 bucket"
            icon="Cloud"
            selected={destinationType === "AWS S3"}
            onClick={() => setDestinationType("AWS S3")}
            disabled={isEditMode && destinationType !== "AWS S3"}
          />
          
          <DestinationTypeButton
            type="Google Drive"
            description="Export to Google Drive (Coming soon)"
            icon="FileText"
            selected={destinationType === "Google Drive"}
            onClick={() => setDestinationType("Google Drive")}
            disabled={(isEditMode && destinationType !== "Google Drive") || true} // Always disabled for now
            isComingSoon={true}
          />
          
          <DestinationTypeButton
            type="Microsoft OneDrive"
            description="Export to Microsoft OneDrive (Coming soon)"
            icon="FileText"
            selected={destinationType === "Microsoft OneDrive"}
            onClick={() => setDestinationType("Microsoft OneDrive")}
            disabled={(isEditMode && destinationType !== "Microsoft OneDrive") || true} // Always disabled for now
            isComingSoon={true}
          />
          
          <DestinationTypeButton
            type="Custom API"
            description="Export to a custom API endpoint"
            icon="Code"
            selected={destinationType === "Custom API"}
            onClick={() => setDestinationType("Custom API")}
            disabled={isEditMode && destinationType !== "Custom API"}
          />
        </div>
      </ScrollArea>
    </div>
  );
};

export default StepOne;
