
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DestinationTypeButton from "./DestinationTypeButton";

interface StepOneProps {
  destinationType: string;
  setDestinationType: (type: string) => void;
}

const StepOne: React.FC<StepOneProps> = ({ destinationType, setDestinationType }) => {
  return (
    <div className="space-y-4 py-4">
      <p className="text-sm text-muted-foreground mb-4">
        Select the type of destination where you want to export your data.
      </p>
      <Tabs defaultValue="cloud" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="cloud">Cloud Storage</TabsTrigger>
          <TabsTrigger value="server">Servers & APIs</TabsTrigger>
        </TabsList>
        <TabsContent value="cloud" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DestinationTypeButton 
              type="Google Drive" 
              selected={destinationType === "Google Drive"}
              onClick={() => setDestinationType("Google Drive")}
            />
            <DestinationTypeButton 
              type="Microsoft OneDrive" 
              selected={destinationType === "Microsoft OneDrive"}
              onClick={() => setDestinationType("Microsoft OneDrive")}
            />
            <DestinationTypeButton 
              type="AWS S3" 
              selected={destinationType === "AWS S3"}
              onClick={() => setDestinationType("AWS S3")}
            />
          </div>
        </TabsContent>
        <TabsContent value="server" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DestinationTypeButton 
              type="FTP/SFTP" 
              selected={destinationType === "FTP/SFTP"}
              onClick={() => setDestinationType("FTP/SFTP")}
            />
            <DestinationTypeButton 
              type="Custom API" 
              selected={destinationType === "Custom API"}
              onClick={() => setDestinationType("Custom API")}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StepOne;
