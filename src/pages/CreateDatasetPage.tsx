
import React from 'react';
import { useCreateDatasetPage } from '@/hooks/datasets/useCreateDatasetPage';
import CreateDatasetWizard from '@/components/datasets/wizard/CreateDatasetWizard';

const CreateDatasetPage = () => {
  const {
    sources,
    datasetState,
    previewHook,
    isCreating,
    progress,
    handleSourceSelection,
    handleTestConnection,
    handleGeneratePreview,
    handleCreateDataset,
    handleSetCurrentStep
  } = useCreateDatasetPage();
  
  return (
    <CreateDatasetWizard
      // State
      currentStep={datasetState.currentStep}
      selectedSourceName={datasetState.selectedSourceName}
      selectedSourceId={datasetState.selectedSourceId}
      selectedSourceType={datasetState.selectedSourceType}
      datasetType={datasetState.datasetType}
      datasetName={datasetState.datasetName}
      selectedTemplate={datasetState.selectedTemplate}
      selectedDependentTemplate={datasetState.selectedDependentTemplate}
      customQuery={datasetState.customQuery}
      previewData={previewHook.previewData}
      previewError={previewHook.previewError}
      isPreviewLoading={previewHook.isPreviewLoading}
      connectionTestResult={previewHook.connectionTestResult}
      isTestingConnection={previewHook.isTestingConnection}
      sources={sources || []}
      isCreating={isCreating}
      progress={progress}
      previewSample={previewHook.previewSample}
      retryCount={previewHook.retryCount}
      
      // Handlers
      onSetCurrentStep={handleSetCurrentStep}
      onSourceSelection={handleSourceSelection}
      onTestConnection={handleTestConnection}
      setDatasetType={datasetState.setDatasetType}
      setDatasetName={datasetState.setDatasetName}
      setSelectedSourceId={datasetState.setSelectedSourceId}
      setSelectedTemplate={datasetState.setSelectedTemplate}
      setSelectedDependentTemplate={datasetState.setSelectedDependentTemplate}
      setCustomQuery={datasetState.setCustomQuery}
      onRegeneratePreview={handleGeneratePreview}
      onCreateDataset={handleCreateDataset}
      onPrevious={datasetState.goToPrevious}
      onNext={datasetState.goToNext}
    />
  );
};

export default CreateDatasetPage;
