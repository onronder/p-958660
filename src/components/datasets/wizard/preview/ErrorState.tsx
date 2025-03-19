
import React from "react";
import { AlertTriangle, RefreshCw, WifiOff, Server } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  isLoading: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, isLoading }) => {
  // Determine if this is a network or edge function error
  const isNetworkError = error.includes('network') || 
                        error.includes('connectivity') || 
                        error.includes('function being temporarily unavailable') ||
                        error.includes('Edge Function');

  // Determine if this is a query or credential error
  const isQueryError = error.includes('GraphQL') || 
                      error.includes('syntax') || 
                      error.includes('query');
                      
  const isCredentialError = error.includes('credential') || 
                           error.includes('auth') || 
                           error.includes('Shopify');

  return (
    <Alert variant="destructive" className="border-red-300">
      {isNetworkError ? <WifiOff className="h-4 w-4" /> : 
       isQueryError ? <AlertTriangle className="h-4 w-4" /> : 
       isCredentialError ? <Server className="h-4 w-4" /> : 
       <AlertTriangle className="h-4 w-4" />}
      
      <AlertTitle>Error loading preview</AlertTitle>
      <AlertDescription>
        {error}
        
        {isNetworkError && (
          <div className="mt-2 text-sm bg-red-50 p-3 rounded-md border border-red-200">
            <p className="font-semibold mb-2">Network Connection Issue:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check your internet connection</li>
              <li>The Edge Function might be temporarily unavailable</li>
              <li>Try refreshing the preview after a few moments</li>
              <li>Check the Edge Function logs in the dev_logs table</li>
            </ul>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                disabled={isLoading}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
            </div>
          </div>
        )}

        {(isQueryError || isCredentialError) && (
          <div className="mt-2 text-sm bg-red-50 p-3 rounded-md border border-red-200">
            <p className="font-semibold mb-2">Troubleshooting tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check the Edge Function logs in the dev_logs table</li>
              {isCredentialError && <li>Verify your Shopify credentials are correct</li>}
              {isQueryError && <li>Ensure your GraphQL query syntax is valid</li>}
              <li>Try refreshing the preview</li>
            </ul>
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                disabled={isLoading}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Connection
              </Button>
            </div>
          </div>
        )}

        {!isNetworkError && !isQueryError && !isCredentialError && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Connection
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorState;
