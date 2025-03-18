
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { StepType } from '@/hooks/datasets/useCreateDatasetState';
import { Progress } from '@/components/ui/progress';

interface CreateDatasetFooterProps {
  currentStep: StepType;
  onPrevious: () => void;
  onNext: () => void;
  onGeneratePreview: () => void;
  onCreateDataset: () => void;
  canProceedToNext: boolean;
  isPreviewLoading: boolean;
  isCreating: boolean;
  progress?: number;
}

const CreateDatasetFooter: React.FC<CreateDatasetFooterProps> = ({
  currentStep,
  onPrevious,
  onNext,
  onGeneratePreview,
  onCreateDataset,
  canProceedToNext,
  isPreviewLoading,
  isCreating,
  progress = 0
}) => {
  return (
    <div className="mt-8">
      {isCreating && (
        <div className="mb-4">
          <div className="flex justify-between mb-2 text-sm">
            <span>Creating dataset</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 'source' ? () => window.location.href = "/datasets" : onPrevious}
          disabled={isCreating}
        >
          {currentStep === 'source' ? 'Cancel' : 'Previous'}
        </Button>
        
        {currentStep === 'preview' ? (
          <div className="space-x-2">
            <Button
              variant="outline"
              onClick={onGeneratePreview}
              disabled={isPreviewLoading || isCreating}
            >
              {isPreviewLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                "Generate Preview"
              )}
            </Button>
            <Button 
              onClick={onCreateDataset} 
              className="gap-1"
              disabled={isCreating || isPreviewLoading}
            >
              {isCreating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Create Dataset
                </>
              )}
            </Button>
          </div>
        ) : (
          <Button 
            onClick={onNext}
            disabled={!canProceedToNext || isCreating}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateDatasetFooter;
