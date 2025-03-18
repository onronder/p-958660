
import React from "react";
import DataPreviewStep from "@/components/datasets/wizard/DataPreviewStep";

interface PreviewStepProps {
  isLoading: boolean;
  previewData: any[];
  error: string | null;
  onRegeneratePreview: () => void;
  onSaveDataset: () => void;
  sourceId?: string;
  connectionTestResult?: {
    success: boolean;
    message: string;
  } | null;
  previewSample?: string | null;
  retryCount?: number;
}

const PreviewStep: React.FC<PreviewStepProps> = ({
  isLoading,
  previewData,
  error,
  onRegeneratePreview,
  onSaveDataset,
  sourceId,
  connectionTestResult,
  previewSample,
  retryCount
}) => {
  return (
    <DataPreviewStep
      isLoading={isLoading}
      previewData={previewData}
      error={error}
      onRegeneratePreview={onRegeneratePreview}
      onSaveDataset={onSaveDataset}
      sourceId={sourceId}
      connectionTestResult={connectionTestResult}
      previewSample={previewSample}
      retryCount={retryCount}
    />
  );
};

export default PreviewStep;
