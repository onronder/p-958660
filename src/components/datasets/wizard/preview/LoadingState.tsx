
import React from "react";
import { Loader2 } from "lucide-react";

const LoadingState: React.FC = () => {
  return (
    <div className="h-64 flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-center">
        <span className="text-muted-foreground">Loading preview data...</span>
        <p className="text-sm text-muted-foreground mt-1">This may take a moment depending on the data source size.</p>
      </div>
    </div>
  );
};

export default LoadingState;
