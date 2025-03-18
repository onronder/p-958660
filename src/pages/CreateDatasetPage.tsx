
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useSources } from '@/hooks/useSources';
import { useNavigate } from 'react-router-dom';

// Custom hooks
import { useCreateDatasetState } from '@/hooks/datasets/useCreateDatasetState';
import { useDatasetPreview } from '@/hooks/datasets/useDatasetPreview';
import { useDatasetCreation } from '@/hooks/datasets/useDatasetCreation';

// Components
import StepSelector from '@/components/datasets/wizard/StepSelector';
import CreateDatasetHeader from '@/components/datasets/wizard/CreateDatasetHeader';
import CreateDatasetFooter from '@/components/datasets/wizard/CreateDatasetFooter';
import WizardStepContent from '@/components/datasets/wizard/WizardStepContent';
import { useWizardNavigation } from '@/components/datasets/wizard/WizardNavigation';

const CreateDatasetPage = () => {
  const navigate = useNavigate();
  const { sources, isLoading: sourcesLoading } = useSources();
  
  // Dataset creation state
  const datasetState = useCreateDatasetState();
  
  // Preview functionality
  const previewHook = useDatasetPreview();
  
  // Dataset creation functionality
  const { isCreating, progress, createDataset } = useDatasetCreation();

  // Navigation validation
  const { canProceedToNext } = useWizardNavigation({
    currentStep: datasetState.currentStep,
    datasetType: datasetState.datasetType,
    selectedSourceId: datasetState.selectedSourceId,
    datasetName: datasetState.datasetName,
    selectedTemplate: datasetState.selectedTemplate,
    selectedDependentTemplate: datasetState.selectedDependentTemplate,
    customQuery: datasetState.customQuery
  });
  
  // Check for sources on load
  useEffect(() => {
    if (!sourcesLoading && sources && sources.length === 0) {
      toast({
        title: "No Data Sources",
        description: "You need to connect a data source before creating a dataset.",
        variant: "destructive",
      });
      navigate("/sources");
    }
  }, [sources, sourcesLoading, navigate]);
  
  // Update source name and type when source ID changes
  useEffect(() => {
    if (datasetState.selectedSourceId && sources) {
      const source = sources.find(s => s.id === datasetState.selectedSourceId);
      if (source) {
        datasetState.setSelectedSourceName(source.name);
        datasetState.setSelectedSourceType(source.source_type);
      }
    }
  }, [datasetState.selectedSourceId, sources]);
  
  // Update preview data from the preview hook
  useEffect(() => {
    if (previewHook.previewData) {
      datasetState.setPreviewData(previewHook.previewData);
    }
    if (previewHook.previewError) {
      datasetState.setPreviewError(previewHook.previewError);
    }
    datasetState.setIsPreviewLoading(previewHook.isPreviewLoading);
    datasetState.setConnectionTestResult(previewHook.connectionTestResult);
  }, [
    previewHook.previewData, 
    previewHook.previewError, 
    previewHook.isPreviewLoading,
    previewHook.connectionTestResult
  ]);
  
  // Handler for source selection
  const handleSourceSelection = (id: string, name: string) => {
    datasetState.setSelectedSourceId(id);
    datasetState.setSelectedSourceName(name);
  };
  
  // Handler for testing connection
  const handleTestConnection = () => {
    toast({
      title: "Testing Connection",
      description: "Testing connection to the selected source...",
    });
  };
  
  // Handler for preview generation
  const handleGeneratePreview = () => {
    previewHook.generatePreview(
      datasetState.datasetType,
      datasetState.selectedSourceId,
      datasetState.selectedTemplate,
      datasetState.selectedDependentTemplate,
      datasetState.customQuery
    );
  };
  
  // Handler for dataset creation
  const handleCreateDataset = () => {
    if (previewHook.previewData.length === 0) {
      toast({
        title: "Preview Required",
        description: "Please generate a preview before creating the dataset.",
        variant: "destructive",
      });
      return;
    }
    
    createDataset(
      datasetState.datasetName,
      datasetState.selectedSourceId,
      datasetState.datasetType,
      datasetState.selectedTemplate,
      previewHook.previewData,
      datasetState.selectedDependentTemplate,
      datasetState.customQuery
    );
  };
  
  // Helper for step selector
  const handleSetCurrentStep = (step: string) => {
    datasetState.setCurrentStep(step as any);
  };
  
  return (
    <div className="space-y-6">
      <CreateDatasetHeader 
        currentStep={datasetState.currentStep}
        selectedSourceName={datasetState.selectedSourceName}
      />
      
      <StepSelector
        currentStep={datasetState.currentStep}
        setCurrentStep={handleSetCurrentStep}
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
          currentStep={datasetState.currentStep}
          sources={sources || []}
          selectedSourceId={datasetState.selectedSourceId}
          selectedSourceType={datasetState.selectedSourceType}
          datasetType={datasetState.datasetType}
          datasetName={datasetState.datasetName}
          selectedTemplate={datasetState.selectedTemplate}
          selectedDependentTemplate={datasetState.selectedDependentTemplate}
          customQuery={datasetState.customQuery}
          isPreviewLoading={previewHook.isPreviewLoading}
          previewData={previewHook.previewData}
          previewError={previewHook.previewError}
          connectionTestResult={previewHook.connectionTestResult}
          previewSample={previewHook.previewSample}
          
          onSourceSelection={handleSourceSelection}
          onTestConnection={handleTestConnection}
          setDatasetType={datasetState.setDatasetType}
          setDatasetName={datasetState.setDatasetName}
          setSelectedSourceId={datasetState.setSelectedSourceId}
          setSelectedTemplate={datasetState.setSelectedTemplate}
          setSelectedDependentTemplate={datasetState.setSelectedDependentTemplate}
          setCustomQuery={datasetState.setCustomQuery}
          onRegeneratePreview={handleGeneratePreview}
          onSaveDataset={handleCreateDataset}
        />
        
        <CreateDatasetFooter
          currentStep={datasetState.currentStep}
          onPrevious={datasetState.goToPrevious}
          onNext={datasetState.goToNext}
          onGeneratePreview={handleGeneratePreview}
          onCreateDataset={handleCreateDataset}
          canProceedToNext={canProceedToNext()}
          isPreviewLoading={previewHook.isPreviewLoading}
          isCreating={isCreating}
          progress={progress}
        />
      </Card>
    </div>
  );
};

export default CreateDatasetPage;
