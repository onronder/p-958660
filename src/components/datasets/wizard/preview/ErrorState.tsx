
import React from "react";
import { AlertCircle, RefreshCw, Loader2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
  isLoading: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, isLoading }) => {
  // Detect specific types of errors
  const isEdgeFunctionError = error.includes('Edge Function') || 
                              error.includes('Failed to fetch') || 
                              error.includes('timeout') ||
                              error.includes('connection');
  
  const isShopifyAuthError = error.includes('authentication') ||
                             error.includes('Access') ||
                             error.includes('token') ||
                             error.includes('credentials') ||
                             error.includes('Shopify API');
  
  const isQueryError = error.includes('query') ||
                       error.includes('GraphQL') ||
                       error.includes('syntax');
  
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
                <li>The server may be temporarily unavailable, please try again in a moment</li>
              </ol>
            </div>
          )}
          
          {isShopifyAuthError && (
            <div className="mt-4 bg-amber-50 p-3 rounded-md border border-amber-200 text-sm">
              <p className="font-semibold mb-1">Shopify Authentication Issue:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Verify that your Shopify credentials are correct and up-to-date</li>
                <li>Ensure you have provided Client ID, Client Secret, and Access Token</li>
                <li>Check that your access token has not expired</li>
                <li>Verify that the store URL is correct</li>
                <li>Confirm your API has access to the requested resources</li>
              </ol>
            </div>
          )}
          
          {isQueryError && (
            <div className="mt-4 bg-blue-50 p-3 rounded-md border border-blue-200 text-sm">
              <p className="font-semibold mb-1">Query Error:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Check your query syntax for errors</li>
                <li>Verify that the GraphQL fields you're requesting exist</li>
                <li>Try simplifying your query to identify problematic parts</li>
                <li>Ensure your query follows Shopify's GraphQL API specifications</li>
              </ol>
            </div>
          )}
          
          <div className="flex justify-between mt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" disabled>
                    <HelpCircle className="h-4 w-4 mr-1" />
                    View Documentation
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Documentation coming soon</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
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
