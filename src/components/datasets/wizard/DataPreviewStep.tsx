
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DataPreviewStepProps {
  isLoading: boolean;
  previewData: any[];
  error?: string | null;
  onRegeneratePreview: () => void;
}

const DataPreviewStep: React.FC<DataPreviewStepProps> = ({
  isLoading,
  previewData,
  error,
  onRegeneratePreview
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Data Preview</h2>
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
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="border rounded-md overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : previewData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  {Object.keys(previewData[0]).map(key => (
                    <th key={key} className="px-4 py-2 text-left font-medium">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((item, rowIndex) => (
                  <tr key={rowIndex} className="border-t border-b even:bg-muted/20">
                    {Object.values(item).map((value: any, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-2">
                        {renderCellValue(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            {error ? 
              error.includes("No source selected") ? 
                "No source selected. Please go back to the source selection step." :
                "Preview generation failed. Try refreshing or check your source configuration." 
              : "No preview data available. Try refreshing the preview."
            }
          </div>
        )}
      </div>
      
      <div className="text-sm text-muted-foreground">
        <p>This is a preview of the first few records that will be included in your dataset.</p>
        {previewData.length > 0 && (
          <p className="mt-2">
            <span className="font-medium">Preview contains:</span> {previewData.length} records.
            The full extraction will likely contain more records.
          </p>
        )}
      </div>
    </div>
  );
};

// Helper function to render cell values based on their type
const renderCellValue = (value: any): React.ReactNode => {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground italic">null</span>;
  }
  
  if (typeof value === "object") {
    return (
      <div className="max-w-xs truncate">
        {JSON.stringify(value)}
      </div>
    );
  }
  
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  
  return String(value);
};

export default DataPreviewStep;
