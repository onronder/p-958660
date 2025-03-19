
import React from "react";
import { AlertTriangle, RefreshCw, WifiOff, Server, Database, Code } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { devLogger } from "@/utils/logger";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  isLoading: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, isLoading }) => {
  // Log the error for debugging purposes
  React.useEffect(() => {
    devLogger.error('Dataset Preview', 'Error State Component', { error });
  }, [error]);

  // Determine if this is a network or edge function error
  const isNetworkError = error.includes('network') || 
                        error.includes('connectivity') || 
                        error.includes('function being temporarily unavailable') ||
                        error.includes('Edge Function') ||
                        error.includes('Failed to fetch') ||
                        error.includes('Failed to send');

  // Determine if this is a query or credential error
  const isQueryError = error.includes('GraphQL') || 
                      error.includes('syntax') || 
                      error.includes('query');
                      
  const isCredentialError = error.includes('credential') || 
                           error.includes('auth') || 
                           error.includes('Shopify') ||
                           error.includes('Unauthorized');
                           
  const isDeploymentError = error.includes('not deployed') ||
                           error.includes('not found') ||
                           error.includes('deployment');

  return (
    <Alert variant="destructive" className="border-red-300">
      {isNetworkError ? <WifiOff className="h-4 w-4" /> : 
       isQueryError ? <Code className="h-4 w-4" /> : 
       isCredentialError ? <Server className="h-4 w-4" /> : 
       isDeploymentError ? <Database className="h-4 w-4" /> :
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
              <li>Check the Edge Function logs in the Supabase dashboard</li>
              <li>Ensure your VPN or firewall isn't blocking the connection</li>
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

        {isDeploymentError && (
          <div className="mt-2 text-sm bg-red-50 p-3 rounded-md border border-red-200">
            <p className="font-semibold mb-2">Edge Function Deployment Issue:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check if the Edge Function is deployed in Supabase</li>
              <li>Ensure config.toml has the correct function paths</li>
              <li>Verify the function name in API calls matches the deployment</li>
              <li>Check the Supabase Edge Function logs for deployment errors</li>
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
                Retry After Checking Deployment
              </Button>
            </div>
          </div>
        )}

        {(isQueryError || isCredentialError) && (
          <div className="mt-2 text-sm bg-red-50 p-3 rounded-md border border-red-200">
            <p className="font-semibold mb-2">Troubleshooting tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check the Edge Function logs in the Supabase dashboard</li>
              {isCredentialError && <li>Verify your Shopify credentials are correct</li>}
              {isQueryError && <li>Ensure your GraphQL query syntax is valid</li>}
              {isCredentialError && <li>Check if your authentication token is being passed correctly</li>}
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

        {!isNetworkError && !isQueryError && !isCredentialError && !isDeploymentError && (
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
