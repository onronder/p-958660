
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
import DatasetTypeStep from '@/components/datasets/wizard/DatasetTypeStep';
import ConfigurationStep from '@/components/datasets/wizard/ConfigurationStep';
import PredefinedDatasetStep from '@/components/datasets/wizard/PredefinedDatasetStep';
import DependentDatasetStep from '@/components/datasets/wizard/DependentDatasetStep';
import CustomDatasetStep from '@/components/datasets/wizard/CustomDatasetStep';
import DataPreviewStep from '@/components/datasets/wizard/DataPreviewStep';
import SourceSelectionStep from '@/components/sources/SourceSelectionStep';
import CreateDatasetHeader from '@/components/datasets/wizard/CreateDatasetHeader';
import CreateDatasetFooter from '@/components/datasets/wizard/CreateDatasetFooter';

const CreateDatasetPage = () => {
  const navigate = useNavigate();
  const { sources, isLoading: sourcesLoading } = useSources();
  
  // Dataset creation state
  const datasetState = useCreateDatasetState();
  
  // Preview functionality
  const previewHook = useDatasetPreview();
  
  // Dataset creation functionality
  const { isCreating, createDataset } = useDatasetCreation();
  
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
    createDataset(
      datasetState.datasetName,
      datasetState.selectedSourceId,
      datasetState.datasetType,
      datasetState.selectedTemplate,
      datasetState.selectedDependentTemplate,
      datasetState.customQuery
    );
  };
  
  // Helper for step selector
  const handleSetCurrentStep = (step: string) => {
    datasetState.setCurrentStep(step as any);
  };
  
  // Check if the selected source is Shopify
  const isShopifySource = datasetState.selectedSourceType.toLowerCase() === 'shopify';
  
  // Rendering helpers
  const renderTemplateStep = () => {
    if (datasetState.datasetType === 'predefined') {
      return (
        <PredefinedDatasetStep
          selectedTemplate={datasetState.selectedTemplate}
          onSelectTemplate={datasetState.setSelectedTemplate}
        />
      );
    } else if (datasetState.datasetType === 'dependent') {
      return (
        <DependentDatasetStep
          selectedTemplate={datasetState.selectedDependentTemplate}
          onSelectTemplate={datasetState.setSelectedDependentTemplate}
        />
      );
    } else {
      return (
        <CustomDatasetStep
          sourceId={datasetState.selectedSourceId}
          query={datasetState.customQuery}
          onQueryChange={datasetState.setCustomQuery}
        />
      );
    }
  };
  
  const renderStepContent = () => {
    switch (datasetState.currentStep) {
      case 'source':
        return (
          <SourceSelectionStep
            sources={sources || []}
            selectedSourceId={datasetState.selectedSourceId}
            onSelectSource={handleSourceSelection}
            onTestConnection={handleTestConnection}
          />
        );
      case 'type':
        return (
          <DatasetTypeStep
            selectedType={datasetState.datasetType}
            onSelectType={datasetState.setDatasetType}
            isShopifySource={isShopifySource}
          />
        );
      case 'configuration':
        return (
          <ConfigurationStep
            name={datasetState.datasetName}
            onNameChange={datasetState.setDatasetName}
            sourceId={datasetState.selectedSourceId}
            onSourceChange={datasetState.setSelectedSourceId}
            sources={sources || []}
            isLoading={sourcesLoading}
            datasetType={datasetState.datasetType}
            templateName={datasetState.datasetType === 'predefined' ? datasetState.selectedTemplate : 
                         datasetState.datasetType === 'dependent' ? datasetState.selectedDependentTemplate : undefined}
          />
        );
      case 'templates':
        return renderTemplateStep();
      case 'preview':
        return (
          <DataPreviewStep
            isLoading={previewHook.isPreviewLoading}
            previewData={previewHook.previewData}
            error={previewHook.previewError}
            onRegeneratePreview={handleGeneratePreview}
            sourceId={datasetState.selectedSourceId}
            connectionTestResult={previewHook.connectionTestResult}
          />
        );
      default:
        return null;
    }
  };

  // Check if we can proceed to the next step
  const canProceedToNext = () => {
    switch (datasetState.currentStep) {
      case 'source':
        return !!datasetState.selectedSourceId;
      case 'type':
        return !!datasetState.datasetType;
      case 'configuration':
        return !!datasetState.datasetName;
      case 'templates':
        if (datasetState.datasetType === 'predefined') return !!datasetState.selectedTemplate;
        if (datasetState.datasetType === 'dependent') return !!datasetState.selectedDependentTemplate;
        if (datasetState.datasetType === 'custom') return !!datasetState.customQuery;
        return false;
      default:
        return true;
    }
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
        {renderStepContent()}
        
        <CreateDatasetFooter
          currentStep={datasetState.currentStep}
          onPrevious={datasetState.goToPrevious}
          onNext={datasetState.goToNext}
          onGeneratePreview={handleGeneratePreview}
          onCreateDataset={handleCreateDataset}
          canProceedToNext={canProceedToNext()}
          isPreviewLoading={previewHook.isPreviewLoading}
          isCreating={isCreating}
        />
      </Card>
    </div>
  );
};

export default CreateDatasetPage;
