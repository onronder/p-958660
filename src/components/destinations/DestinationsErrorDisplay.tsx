
import React from "react";
import { AlertCircle, WifiOff, KeyRound, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DestinationsErrorDisplayProps {
  error: Error | null;
  isUserLoggedIn: boolean;
  onRetry?: () => void;
}

const DestinationsErrorDisplay: React.FC<DestinationsErrorDisplayProps> = ({
  error,
  isUserLoggedIn,
  onRetry,
}) => {
  // If there's no error and user is logged in, don't render anything
  if (!error && isUserLoggedIn) {
    return null;
  }

  // Display error message if there's an error
  if (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to load destinations";
    const isNetworkError = errorMessage.includes("Network") || 
                           errorMessage.includes("connectivity") || 
                           errorMessage.includes("CORS") ||
                           errorMessage.includes("Failed to fetch");
    
    const isAuthError = errorMessage.includes("Authentication") || 
                        errorMessage.includes("log in") ||
                        errorMessage.includes("token");
                        
    return (
      <Alert variant="destructive" className="mb-6">
        {isNetworkError ? (
          <WifiOff className="h-4 w-4" />
        ) : isAuthError ? (
          <KeyRound className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertTitle>{isNetworkError ? "Network Error" : isAuthError ? "Authentication Error" : "Error"}</AlertTitle>
        <div className="flex flex-col space-y-2">
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
          {onRetry && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="self-start mt-2"
            >
              <RefreshCw className="h-3 w-3 mr-2" /> Retry
            </Button>
          )}
        </div>
      </Alert>
    );
  }

  // Display auth required message if user is not logged in
  return (
    <Alert>
      <KeyRound className="h-4 w-4" />
      <AlertTitle>Authentication Required</AlertTitle>
      <AlertDescription>
        Please log in to manage your destinations.
      </AlertDescription>
    </Alert>
  );
};

export default DestinationsErrorDisplay;
