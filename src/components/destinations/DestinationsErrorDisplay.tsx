
import React from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DestinationsErrorDisplayProps {
  error: Error | null;
  isUserLoggedIn: boolean;
}

const DestinationsErrorDisplay: React.FC<DestinationsErrorDisplayProps> = ({
  error,
  isUserLoggedIn,
}) => {
  if (!error && isUserLoggedIn) {
    return null;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Failed to load destinations"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Authentication Required</AlertTitle>
      <AlertDescription>
        Please log in to manage your destinations.
      </AlertDescription>
    </Alert>
  );
};

export default DestinationsErrorDisplay;
