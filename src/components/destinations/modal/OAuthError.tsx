
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
        {(error.error === "redirect_uri_mismatch" || error.description.includes("Redirect URI mismatch")) && (
          <div className="mt-2">
            <p className="text-sm mt-2">To fix this:</p>
            <ol className="list-decimal list-inside text-sm mt-1">
              <li>Go to Google Cloud Console or Microsoft Azure Portal</li>
              <li>Navigate to your OAuth application settings</li>
              <li>Add the following URL to your authorized redirect URIs:</li>
              <li className="font-mono text-xs break-all mt-1 bg-muted p-2 rounded">
                {window.location.origin}/auth/callback
              </li>
              <li>Save changes and try again</li>
            </ol>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default OAuthError;
