
import React, { useEffect } from "react";
import { devLogger } from "@/utils/logger";
import { AlertCircle } from "lucide-react";
import PreviewHeader from "./PreviewHeader";
import ConnectionStatus from "./ConnectionStatus";
import LoadingState from "./LoadingState";
import ErrorState from "./ErrorState";
import EmptyState from "./EmptyState";
import PreviewContent from "./PreviewContent";

interface DataPreviewProps {
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

const DataPreview: React.FC<DataPreviewProps> = ({
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
  useEffect(() => {
    devLogger.debug('DataPreview', 'Component rendered', {
      hasSourceId: !!sourceId,
      hasPreviewData: previewData?.length > 0,
      hasError: !!error,
      connectionTestSuccess: connectionTestResult?.success,
      retryCount
    });
  }, [sourceId, previewData, error, connectionTestResult, retryCount]);

  // Handle refresh preview
  const handleRefreshPreview = () => {
    devLogger.info('DataPreview', 'Refresh preview clicked');
    onRegeneratePreview();
  };

  // Handle save dataset
  const handleSaveDataset = () => {
    devLogger.info('DataPreview', 'Save dataset clicked', {
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
      <PreviewHeader 
        onRefreshPreview={handleRefreshPreview}
        onSaveDataset={handleSaveDataset}
        isLoading={isLoading}
        hasPreviewData={previewData.length > 0}
        retryCount={retryCount}
      />
      
      {connectionTestResult && (
        <ConnectionStatus connectionTestResult={connectionTestResult} />
      )}
      
      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState 
          error={error} 
          onRetry={handleRefreshPreview} 
          isLoading={isLoading} 
        />
      ) : previewData.length === 0 ? (
        <EmptyState onGeneratePreview={handleRefreshPreview} />
      ) : (
        <PreviewContent 
          previewData={previewData} 
          previewSample={previewSample} 
        />
      )}
    </div>
  );
};

export default DataPreview;
