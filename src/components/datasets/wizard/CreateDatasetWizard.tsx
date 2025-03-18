
import React from 'react';
import { Card } from '@/components/ui/card';
import { StepType } from '@/hooks/datasets/state/types';
import { useWizardNavigation } from '@/components/datasets/wizard/WizardNavigation';
import { Source } from '@/types/source';

// Components
import StepSelector from '@/components/datasets/wizard/StepSelector';
import CreateDatasetHeader from '@/components/datasets/wizard/CreateDatasetHeader';
import CreateDatasetFooter from '@/components/datasets/wizard/CreateDatasetFooter';
import WizardStepContent from '@/components/datasets/wizard/WizardStepContent';

interface CreateDatasetWizardProps {
  // State
  currentStep: StepType;
  selectedSourceName: string;
  selectedSourceId: string;
  selectedSourceType: string;
  datasetType: 'predefined' | 'dependent' | 'custom';
  datasetName: string;
  selectedTemplate: string;
  selectedDependentTemplate: string;
  customQuery: string;
  previewData: any[];
  previewError: string | null;
  isPreviewLoading: boolean;
  connectionTestResult?: { success: boolean; message: string };
  isTestingConnection?: boolean;
  sources: Source[];
  isCreating: boolean;
  progress: number;
  previewSample?: string | null;
  retryCount?: number;
  
  // Handlers
  onSetCurrentStep: (step: string) => void;
  onSourceSelection: (id: string, name: string) => void;
  onTestConnection: () => void;
  setDatasetType: (type: 'predefined' | 'dependent' | 'custom') => void;
  setDatasetName: (name: string) => void;
  setSelectedSourceId: (id: string) => void;
  setSelectedTemplate: (template: string) => void;
  setSelectedDependentTemplate: (template: string) => void;
  setCustomQuery: (query: string) => void;
  onRegeneratePreview: () => void;
  onCreateDataset: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const CreateDatasetWizard: React.FC<CreateDatasetWizardProps> = ({
  // State
  currentStep,
  selectedSourceName,
  selectedSourceId,
  selectedSourceType,
  datasetType,
  datasetName,
  selectedTemplate,
  selectedDependentTemplate,
  customQuery,
  previewData,
  previewError,
  isPreviewLoading,
  connectionTestResult,
  isTestingConnection,
  sources,
  isCreating,
  progress,
  previewSample,
  retryCount,
  
  // Handlers
  onSetCurrentStep,
  onSourceSelection,
  onTestConnection,
  setDatasetType,
  setDatasetName,
  setSelectedSourceId,
  setSelectedTemplate,
  setSelectedDependentTemplate,
  setCustomQuery,
  onRegeneratePreview,
  onCreateDataset,
  onPrevious,
  onNext
}) => {
  // Navigation validation
  const { canProceedToNext } = useWizardNavigation({
    currentStep,
    datasetType,
    selectedSourceId,
    datasetName,
    selectedTemplate,
    selectedDependentTemplate,
    customQuery
  });
  
  return (
    <div className="space-y-6">
      <CreateDatasetHeader 
        currentStep={currentStep}
        selectedSourceName={selectedSourceName}
      />
      
      <StepSelector
        currentStep={currentStep}
        setCurrentStep={onSetCurrentStep}
        steps={[
          { id: 'source', label: 'Source' },
          { id: 'type', label: 'Type' },
          { id: 'configuration', label: 'Config' },
          { id: 'templates', label: 'Data Selection' },
          { id: 'preview', label: 'Preview' }
        ]}
      />
      
      <Card className="p-6">
        <WizardStepContent
          currentStep={currentStep}
          sources={sources || []}
          selectedSourceId={selectedSourceId}
          selectedSourceType={selectedSourceType}
          datasetType={datasetType}
          datasetName={datasetName}
          selectedTemplate={selectedTemplate}
          selectedDependentTemplate={selectedDependentTemplate}
          customQuery={customQuery}
          isPreviewLoading={isPreviewLoading}
          previewData={previewData}
          previewError={previewError}
          connectionTestResult={connectionTestResult}
          previewSample={previewSample}
          isTestingConnection={isTestingConnection}
          retryCount={retryCount}
          
          onSourceSelection={onSourceSelection}
          onTestConnection={onTestConnection}
          setDatasetType={setDatasetType}
          setDatasetName={setDatasetName}
          setSelectedSourceId={setSelectedSourceId}
          setSelectedTemplate={setSelectedTemplate}
          setSelectedDependentTemplate={setSelectedDependentTemplate}
          setCustomQuery={setCustomQuery}
          onRegeneratePreview={onRegeneratePreview}
          onSaveDataset={onCreateDataset}
        />
        
        <CreateDatasetFooter
          currentStep={currentStep}
          onPrevious={onPrevious}
          onNext={onNext}
          onGeneratePreview={onRegeneratePreview}
          onCreateDataset={onCreateDataset}
          canProceedToNext={canProceedToNext()}
          isPreviewLoading={isPreviewLoading}
          isCreating={isCreating}
          progress={progress}
        />
      </Card>
    </div>
  );
};

export default CreateDatasetWizard;
