
import React from "react";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DismissButton from "@/components/info/DismissButton";
import { useDismissibleHelp } from "@/hooks/useDismissibleHelp";

const DestinationsInfoBanner = () => {
  const { isDismissed, dismissMessage } = useDismissibleHelp("destinations-info");

  if (isDismissed) return null;

  return (
    <Alert 
      className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 text-blue-800 dark:text-blue-200 mb-6"
    >
      <div className="flex items-start">
        <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
        <AlertDescription className="text-sm">
          <span className="font-bold">⚡ Destinations</span> allow you to export your data to various third-party services and storage solutions. Connect to FTP servers, cloud storage, or custom APIs to automate your data flow.
        </AlertDescription>
      </div>
      <DismissButton onDismiss={dismissMessage} />
    </Alert>
  );
};

export default DestinationsInfoBanner;
