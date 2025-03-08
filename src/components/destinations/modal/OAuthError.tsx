
import React from "react";
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface OAuthErrorProps {
  error: {
    error: string;
    description: string;
    detailedMessage?: string;
  } | null;
}

const OAuthError: React.FC<OAuthErrorProps> = ({ error }) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{error.description}</AlertTitle>
      <AlertDescription>
        {error.detailedMessage || "Please try again or contact support."}
        {error.error === "access_denied" && (
          <div className="mt-2">
            <p className="text-sm mt-2">To fix this:</p>
            <ol className="list-decimal list-inside text-sm mt-1">
              <li>Go to Google Cloud Console</li>
              <li>Navigate to "APIs & Services" &gt; "OAuth consent screen"</li>
              <li>Add your email as a test user</li>
              <li>Try again</li>
            </ol>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default OAuthError;
