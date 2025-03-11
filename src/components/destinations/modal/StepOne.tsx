
import React from "react";
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
    <div className="grid grid-cols-2 gap-4 mt-6">
      <DestinationTypeButton
        type="Google Drive"
        selected={destinationType === "Google Drive"}
        onClick={() => setDestinationType("Google Drive")}
        disabled={isEditMode}
        icon="drive"
      />
      
      <DestinationTypeButton
        type="Microsoft OneDrive"
        selected={destinationType === "Microsoft OneDrive"}
        onClick={() => setDestinationType("Microsoft OneDrive")}
        disabled={isEditMode}
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
        disabled={isEditMode}
        icon="ftp"
      />
    </div>
  );
};

export default StepOne;
