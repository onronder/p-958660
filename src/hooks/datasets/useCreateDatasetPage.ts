
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useSources } from '@/hooks/useSources';
import { useCreateDatasetState } from '@/hooks/datasets/useCreateDatasetState';
import { useDatasetPreview } from '@/hooks/datasets/useDatasetPreview';
import { useDatasetCreation } from '@/hooks/datasets/useDatasetCreation';
import { devLogger } from '@/utils/DevLogger';

export function useCreateDatasetPage() {
  const navigate = useNavigate();
  const { sources, isLoading: sourcesLoading } = useSources();
  
  // Dataset creation state
  const datasetState = useCreateDatasetState();
  
  // Preview functionality
  const previewHook = useDatasetPreview();
  
  // Dataset creation functionality
  const { isCreating, progress, createDataset } = useDatasetCreation();
  
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
    devLogger.debug('CreateDatasetPage', 'Source selected', { id, name });
    datasetState.setSelectedSourceId(id);
    datasetState.setSelectedSourceName(name);
  };
  
  // Handler for testing connection
  const handleTestConnection = async () => {
    devLogger.debug('CreateDatasetPage', 'Testing connection');
    
    if (!datasetState.selectedSourceId) {
      toast({
        title: "No Source Selected",
        description: "Please select a data source before testing connection.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Testing Connection",
      description: "Testing connection to the selected source...",
    });
    
    // Use the test connection function from previewHook
    const result = await previewHook.testConnection(datasetState.selectedSourceId);
    
    // The result will be shown through the connectionTestResult state
    // which is already being updated via the useEffect above
    
    devLogger.debug('CreateDatasetPage', 'Connection test completed', {
      success: result.success,
      message: result.message
    });
  };
  
  // Handler for preview generation
  const handleGeneratePreview = () => {
    devLogger.debug('CreateDatasetPage', 'Generating preview');
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
    devLogger.debug('CreateDatasetPage', 'Creating dataset', {
      hasPreviewData: previewHook.previewData.length > 0
    });
    
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

  return {
    sources,
    sourcesLoading,
    datasetState,
    previewHook,
    isCreating,
    progress,
    handleSourceSelection,
    handleTestConnection,
    handleGeneratePreview,
    handleCreateDataset,
    handleSetCurrentStep
  };
}
