
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertCircle, CheckCircle, Save } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DataPreviewStepProps {
  isLoading: boolean;
  previewData: any[];
  error: string | null;
  onRegeneratePreview: () => void;
  onSaveDataset?: () => void;
  sourceId?: string;
  connectionTestResult?: {
    success: boolean;
    message: string;
  };
  previewSample?: string | null;
}

const DataPreviewStep: React.FC<DataPreviewStepProps> = ({
  isLoading,
  previewData,
  previewSample,
  error,
  onRegeneratePreview,
  onSaveDataset,
  sourceId,
  connectionTestResult
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
        <div className="space-x-2">
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
          
          {previewData.length > 0 && onSaveDataset && (
            <Button
              variant="default"
              size="sm"
              onClick={onSaveDataset}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Dataset
            </Button>
          )}
        </div>
      </div>
      
      {connectionTestResult && (
        <div className={`p-4 border rounded-md ${connectionTestResult.success ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
          <div className="flex items-start">
            {connectionTestResult.success ? (
              <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{connectionTestResult.success ? 'Connection Successful' : 'Connection Failed'}</p>
              <p className="mt-1">{connectionTestResult.message}</p>
            </div>
          </div>
        </div>
      )}
      
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
        <div className="space-y-4">
          {previewSample && (
            <Alert>
              <AlertTitle>Data Sample (First {Math.min(previewData.length, 3)} records)</AlertTitle>
              <AlertDescription>
                <pre className="text-xs p-2 bg-gray-50 rounded-md overflow-auto mt-2 max-h-48">
                  {previewSample}
                </pre>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="overflow-auto max-h-96">
            <pre className="text-xs p-4 bg-muted rounded-md">
              {JSON.stringify(previewData, null, 2)}
            </pre>
          </div>
          
          {previewData.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Total records: <span className="font-medium">{previewData.length}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataPreviewStep;
