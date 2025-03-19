
import React from "react";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  isLoading: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, isLoading }) => {
  const isEdgeFunctionError = error.includes('Edge Function') || 
                              error.includes('Failed to fetch') || 
                              error.includes('timeout');
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-5 w-5" />
      <AlertTitle className="ml-2 font-semibold">Error Generating Preview</AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          <p className="whitespace-pre-line">{error}</p>
          
          {isEdgeFunctionError && (
            <div className="mt-4 bg-red-50 p-3 rounded-md border border-red-200 text-sm">
              <p className="font-semibold mb-1">Troubleshooting Steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Check your internet connection</li>
                <li>Verify that the Supabase Edge Function is deployed</li>
                <li>Ensure your session is valid (try signing out and back in)</li>
                <li>Check the console logs for more details</li>
                <li>If the issue persists, contact support</li>
              </ol>
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <Button 
              onClick={onRetry} 
              disabled={isLoading}
              variant="secondary"
              className="gap-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> 
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" /> 
                  Retry
                </>
              )}
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ErrorState;
