
import React from 'react';
import { Source } from '@/types/source';
import { StepType } from '@/hooks/datasets/state/types';

// Import our separated step components
import SourceStep from './steps/SourceStep';
import TypeStep from './steps/TypeStep';
import ConfigurationStep from './steps/ConfigurationStep';
import TemplateStep from './steps/TemplateStep';
import PreviewStep from './steps/PreviewStep';

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
  connectionTestResult?: { success: boolean; message: string } | null;
  previewSample?: string | null;
  isTestingConnection?: boolean;
  retryCount?: number;
  
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
  isTestingConnection,
  retryCount,
  
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
  
  // Determine which component to render based on the current step
  switch (currentStep) {
    case 'source':
      return (
        <SourceStep
          sources={sources || []}
          selectedSourceId={selectedSourceId}
          onSelectSource={onSourceSelection}
          onTestConnection={onTestConnection}
          connectionTestResult={connectionTestResult}
          isTestingConnection={isTestingConnection}
        />
      );
      
    case 'type':
      return (
        <TypeStep
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
          datasetType={datasetType}
          templateName={datasetType === 'predefined' ? selectedTemplate : 
                      datasetType === 'dependent' ? selectedDependentTemplate : undefined}
        />
      );
      
    case 'templates':
      return (
        <TemplateStep
          datasetType={datasetType}
          selectedTemplate={selectedTemplate}
          selectedDependentTemplate={selectedDependentTemplate}
          customQuery={customQuery}
          selectedSourceId={selectedSourceId}
          onSelectTemplate={setSelectedTemplate}
          onSelectDependentTemplate={setSelectedDependentTemplate}
          onCustomQueryChange={setCustomQuery}
        />
      );
      
    case 'preview':
      return (
        <PreviewStep
          isLoading={isPreviewLoading}
          previewData={previewData}
          error={previewError}
          onRegeneratePreview={onRegeneratePreview}
          onSaveDataset={onSaveDataset}
          sourceId={selectedSourceId}
          connectionTestResult={connectionTestResult}
          previewSample={previewSample}
          retryCount={retryCount}
        />
      );
      
    default:
      return null;
  }
};

export default WizardStepContent;
