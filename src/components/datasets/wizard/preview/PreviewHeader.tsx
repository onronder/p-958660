
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Save } from "lucide-react";

interface PreviewHeaderProps {
  onRefreshPreview: () => void;
  onSaveDataset?: () => void;
  isLoading: boolean;
  hasPreviewData: boolean;
  retryCount?: number;
}

const PreviewHeader: React.FC<PreviewHeaderProps> = ({
  onRefreshPreview,
  onSaveDataset,
  isLoading,
  hasPreviewData,
  retryCount = 0
}) => {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">Data Preview</h3>
      <div className="space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefreshPreview}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {retryCount > 0 ? `Retry (${retryCount})` : 'Refresh Preview'}
        </Button>
        
        {hasPreviewData && onSaveDataset && (
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
  );
};

export default PreviewHeader;
