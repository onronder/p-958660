
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";

interface DataPreviewStepProps {
  isLoading: boolean;
  previewData: any[];
  error: string | null;
  onRegeneratePreview: () => void;
  sourceId?: string;
}

const DataPreviewStep: React.FC<DataPreviewStepProps> = ({
  isLoading,
  previewData,
  error,
  onRegeneratePreview,
  sourceId
}) => {
  if (!sourceId) {
    return (
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">Source Selection Required</p>
              <p className="mt-1">Please select a data source before previewing data.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Data Preview</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onRegeneratePreview}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Refresh Preview
        </Button>
      </div>
      
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading preview data...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
          <p className="font-medium">Error loading preview:</p>
          <p className="mt-1">{error}</p>
        </div>
      ) : previewData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-muted-foreground">
          No preview data available. Try refreshing or adjusting your query.
        </div>
      ) : (
        <div className="overflow-auto max-h-96">
          <pre className="text-xs p-4 bg-muted rounded-md">
            {JSON.stringify(previewData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DataPreviewStep;
