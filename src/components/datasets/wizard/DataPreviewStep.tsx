
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertCircle, CheckCircle, Save, Database, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { devLogger } from "@/utils/logger";

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
  } | null;
  previewSample?: string | null;
  retryCount?: number;
}

const DataPreviewStep: React.FC<DataPreviewStepProps> = ({
  isLoading,
  previewData,
  previewSample,
  error,
  onRegeneratePreview,
  onSaveDataset,
  sourceId,
  connectionTestResult,
  retryCount = 0
}) => {
  // Log component render
  React.useEffect(() => {
    devLogger.debug('DataPreviewStep', 'Component rendered', {
      hasSourceId: !!sourceId,
      hasPreviewData: previewData?.length > 0,
      hasError: !!error,
      connectionTestSuccess: connectionTestResult?.success,
      retryCount
    });
  }, [sourceId, previewData, error, connectionTestResult, retryCount]);

  // Handle refresh preview
  const handleRefreshPreview = () => {
    devLogger.info('DataPreviewStep', 'Refresh preview clicked');
    onRegeneratePreview();
  };

  // Handle save dataset
  const handleSaveDataset = () => {
    devLogger.info('DataPreviewStep', 'Save dataset clicked', {
      previewDataCount: previewData?.length || 0
    });
    onSaveDataset?.();
  };

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
            onClick={handleRefreshPreview}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {retryCount > 0 ? `Retry (${retryCount})` : 'Refresh Preview'}
          </Button>
          
          {previewData.length > 0 && onSaveDataset && (
            <Button
              variant="default"
              size="sm"
              onClick={handleSaveDataset}
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
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div className="text-center">
            <span className="text-muted-foreground">Loading preview data...</span>
            <p className="text-sm text-muted-foreground mt-1">This may take a moment depending on the data source size.</p>
          </div>
        </div>
      ) : error ? (
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
                    onClick={handleRefreshPreview}
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
      ) : previewData.length === 0 ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <Database className="h-12 w-12 text-muted-foreground opacity-30" />
          <div className="text-center">
            <p className="text-muted-foreground">No preview data available.</p>
            <p className="text-sm text-muted-foreground mt-1">Try refreshing or adjusting your query.</p>
          </div>
          <Button onClick={handleRefreshPreview} variant="outline">Generate Preview</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {previewSample && (
            <Card>
              <CardContent className="pt-6">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Data Sample (First {Math.min(previewData.length, 3)} records)</h4>
                  <span className="text-xs text-muted-foreground">
                    Showing {Math.min(previewData.length, 3)} of {previewData.length} records
                  </span>
                </div>
                
                <pre className="text-xs p-4 bg-slate-50 rounded-md overflow-auto mt-2 max-h-72 border">
                  {previewSample}
                </pre>
              </CardContent>
            </Card>
          )}
          
          <div className="bg-muted/20 p-4 rounded-md border">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-sm font-semibold">Full Preview Data</h4>
              <div className="text-xs text-muted-foreground">
                Total records: <span className="font-medium">{previewData.length}</span>
              </div>
            </div>
            
            <div className="overflow-auto max-h-96 border rounded-md">
              <pre className="text-xs p-4 bg-white">
                {JSON.stringify(previewData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataPreviewStep;
