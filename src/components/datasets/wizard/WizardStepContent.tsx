
import React from 'react';
import SourceSelectionStep from '@/components/sources/SourceSelectionStep';
import DatasetTypeStep from './DatasetTypeStep';
import ConfigurationStep from './ConfigurationStep';
import PredefinedDatasetStep from './PredefinedDatasetStep';
import DependentDatasetStep from './DependentDatasetStep';
import CustomDatasetStep from './CustomDatasetStep';
import DataPreviewStep from './DataPreviewStep';
import { Source } from '@/types/source';
import { StepType } from '@/hooks/datasets/useCreateDatasetState';

interface WizardStepContentProps {
  currentStep: StepType;
  sources: Source[];
  selectedSourceId: string;
  selectedSourceType: string;
  datasetType: 'predefined' | 'dependent' | 'custom';
  datasetName: string;
  selectedTemplate: string;
  selectedDependentTemplate: string;
  customQuery: string;
  isPreviewLoading: boolean;
  previewData: any[];
  previewError: string | null;
  connectionTestResult?: { success: boolean; message: string };
  previewSample?: string | null;
  
  // Handlers
  onSourceSelection: (id: string, name: string) => void;
  onTestConnection: () => void;
  setDatasetType: (type: 'predefined' | 'dependent' | 'custom') => void;
  setDatasetName: (name: string) => void;
  setSelectedSourceId: (id: string) => void;
  setSelectedTemplate: (template: string) => void;
  setSelectedDependentTemplate: (template: string) => void;
  setCustomQuery: (query: string) => void;
  onRegeneratePreview: () => void;
  onSaveDataset: () => void;
}

const WizardStepContent: React.FC<WizardStepContentProps> = ({
  currentStep,
  sources,
  selectedSourceId,
  selectedSourceType,
  datasetType,
  datasetName,
  selectedTemplate,
  selectedDependentTemplate,
  customQuery,
  isPreviewLoading,
  previewData,
  previewError,
  connectionTestResult,
  previewSample,
  
  // Handlers
  onSourceSelection,
  onTestConnection,
  setDatasetType,
  setDatasetName,
  setSelectedSourceId,
  setSelectedTemplate,
  setSelectedDependentTemplate,
  setCustomQuery,
  onRegeneratePreview,
  onSaveDataset
}) => {
  // Check if the selected source is Shopify
  const isShopifySource = selectedSourceType.toLowerCase() === 'shopify';
  
  // Helper function to render the template step based on the dataset type
  const renderTemplateStep = () => {
    if (datasetType === 'predefined') {
      return (
        <PredefinedDatasetStep
          selectedTemplate={selectedTemplate}
          onSelectTemplate={setSelectedTemplate}
        />
      );
    } else if (datasetType === 'dependent') {
      return (
        <DependentDatasetStep
          selectedTemplate={selectedDependentTemplate}
          onSelectTemplate={setSelectedDependentTemplate}
        />
      );
    } else {
      return (
        <CustomDatasetStep
          sourceId={selectedSourceId}
          query={customQuery}
          onQueryChange={setCustomQuery}
        />
      );
    }
  };

  switch (currentStep) {
    case 'source':
      return (
        <SourceSelectionStep
          sources={sources || []}
          selectedSourceId={selectedSourceId}
          onSelectSource={onSourceSelection}
          onTestConnection={onTestConnection}
        />
      );
    case 'type':
      return (
        <DatasetTypeStep
          selectedType={datasetType}
          onSelectType={setDatasetType}
          isShopifySource={isShopifySource}
        />
      );
    case 'configuration':
      return (
        <ConfigurationStep
          name={datasetName}
          onNameChange={setDatasetName}
          sourceId={selectedSourceId}
          onSourceChange={setSelectedSourceId}
          sources={sources || []}
          isLoading={false}
          datasetType={datasetType}
          templateName={datasetType === 'predefined' ? selectedTemplate : 
                      datasetType === 'dependent' ? selectedDependentTemplate : undefined}
        />
      );
    case 'templates':
      return renderTemplateStep();
    case 'preview':
      return (
        <DataPreviewStep
          isLoading={isPreviewLoading}
          previewData={previewData}
          error={previewError}
          onRegeneratePreview={onRegeneratePreview}
          onSaveDataset={onSaveDataset}
          sourceId={selectedSourceId}
          connectionTestResult={connectionTestResult}
          previewSample={previewSample}
        />
      );
    default:
      return null;
  }
};

export default WizardStepContent;
