
import { useState } from "react";
import { useTransformationPreview as useOriginalTransformationPreview } from "@/hooks/transformations/useTransformationPreview";

interface UsePreviewProps {
  sourceId: string;
  fields: any[];
  derivedColumns: any[];
  skipTransformation: boolean;
}

export const useTransformationPreviewState = ({
  sourceId,
  fields,
  derivedColumns,
  skipTransformation
}: UsePreviewProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { 
    previewData, 
    showPreview, 
    isLoadingPreview, 
    generatePreview: originalGeneratePreview, 
  } = useOriginalTransformationPreview();

  // Handle generating preview with consolidated loading state
  const handleGeneratePreview = async (validateFn: () => boolean) => {
    setIsLoading(true);
    await originalGeneratePreview(sourceId, fields, derivedColumns, skipTransformation, validateFn);
    setIsLoading(false);
  };

  return {
    isLoading: isLoading || isLoadingPreview,
    previewData,
    showPreview,
    generatePreview: handleGeneratePreview
  };
};
