
import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  isLoading: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, isLoading }) => {
  return (
    <Alert variant="destructive" className="border-red-300">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error loading preview</AlertTitle>
      <AlertDescription>
        {error}
        {error.includes('Edge Function') && (
          <div className="mt-2 text-sm bg-red-50 p-3 rounded-md border border-red-200">
            <p className="font-semibold mb-2">Troubleshooting tips:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Check the Edge Function logs in the dev_logs table</li>
              <li>Verify your Shopify credentials are correct</li>
              <li>Ensure your GraphQL query syntax is valid</li>
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
      </AlertDescription>
    </Alert>
  );
};

export default ErrorState;
