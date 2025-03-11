
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ConnectionTestButtonProps {
  status: "Active" | "Pending" | "Failed" | "Deleted";
  onTestConnection: () => void;
  isTesting: boolean;
}

const ConnectionTestButton: React.FC<ConnectionTestButtonProps> = ({
  status,
  onTestConnection,
  isTesting,
}) => {
  if (status === "Failed") {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onTestConnection}
        className="text-destructive border-destructive hover:bg-destructive/10"
        disabled={isTesting}
      >
        {isTesting ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Retrying...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </>
        )}
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onTestConnection}
      disabled={isTesting || status === "Deleted"}
    >
      {isTesting ? (
        <>
          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          Testing...
        </>
      ) : (
        "Test Connection"
      )}
    </Button>
  );
};

export default ConnectionTestButton;
