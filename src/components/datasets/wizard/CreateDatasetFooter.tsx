
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { StepType } from '@/hooks/datasets/useCreateDatasetState';

interface CreateDatasetFooterProps {
  currentStep: StepType;
  onPrevious: () => void;
  onNext: () => void;
  onGeneratePreview: () => void;
  onCreateDataset: () => void;
  canProceedToNext: boolean;
  isPreviewLoading: boolean;
  isCreating: boolean;
}

const CreateDatasetFooter: React.FC<CreateDatasetFooterProps> = ({
  currentStep,
  onPrevious,
  onNext,
  onGeneratePreview,
  onCreateDataset,
  canProceedToNext,
  isPreviewLoading,
  isCreating
}) => {
  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="outline"
        onClick={currentStep === 'source' ? () => window.location.href = "/datasets" : onPrevious}
      >
        {currentStep === 'source' ? 'Cancel' : 'Previous'}
      </Button>
      
      {currentStep === 'preview' ? (
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={onGeneratePreview}
            disabled={isPreviewLoading}
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
            disabled={isCreating}
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
          disabled={!canProceedToNext}
        >
          Next
        </Button>
      )}
    </div>
  );
};

export default CreateDatasetFooter;
