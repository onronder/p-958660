
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSources } from '@/hooks/useSources';
import StepSelector from '@/components/datasets/wizard/StepSelector';
import DatasetTypeStep from '@/components/datasets/wizard/DatasetTypeStep';
import ConfigurationStep from '@/components/datasets/wizard/ConfigurationStep';
import PredefinedDatasetStep from '@/components/datasets/wizard/PredefinedDatasetStep';
import DependentDatasetStep from '@/components/datasets/wizard/DependentDatasetStep';
import CustomDatasetStep from '@/components/datasets/wizard/CustomDatasetStep';
import DataPreviewStep from '@/components/datasets/wizard/DataPreviewStep';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Dataset } from '@/types/dataset';

// Step types
type StepType = 'type' | 'configuration' | 'templates' | 'preview';

const CreateDatasetPage = () => {
  const navigate = useNavigate();
  const { sources, isLoading: sourcesLoading } = useSources();
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState<StepType>('type');
  const [datasetType, setDatasetType] = useState<'predefined' | 'dependent' | 'custom'>('predefined');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [selectedSourceName, setSelectedSourceName] = useState<string>('');
  const [datasetName, setDatasetName] = useState<string>('');
  
  // Templates state
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedDependentTemplate, setSelectedDependentTemplate] = useState<string>('');
  const [customQuery, setCustomQuery] = useState<string>('');
  
  // Preview state
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{success: boolean; message: string} | undefined>(undefined);
  
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
  
  // Update source name when source ID changes
  useEffect(() => {
    if (selectedSourceId && sources) {
      const source = sources.find(s => s.id === selectedSourceId);
      if (source) {
        setSelectedSourceName(source.name);
      }
    }
  }, [selectedSourceId, sources]);
  
  // Parse saved state from sessionStorage on component mount
  useEffect(() => {
    try {
      const savedState = sessionStorage.getItem('createDatasetState');
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Restore saved state
        if (parsedState.currentStep) setCurrentStep(parsedState.currentStep as StepType);
        if (parsedState.datasetType) setDatasetType(parsedState.datasetType);
        if (parsedState.selectedSourceId) setSelectedSourceId(parsedState.selectedSourceId);
        if (parsedState.datasetName) setDatasetName(parsedState.datasetName);
        if (parsedState.selectedTemplate) setSelectedTemplate(parsedState.selectedTemplate);
        if (parsedState.selectedDependentTemplate) setSelectedDependentTemplate(parsedState.selectedDependentTemplate);
        if (parsedState.customQuery) setCustomQuery(parsedState.customQuery);
      }
    } catch (error) {
      console.error("Error parsing saved dataset creation state:", error);
      // Clear corrupted state
      sessionStorage.removeItem('createDatasetState');
    }
  }, []);
  
  // Save current state to sessionStorage whenever it changes
  useEffect(() => {
    const stateToSave = {
      currentStep,
      datasetType,
      selectedSourceId,
      datasetName,
      selectedTemplate,
      selectedDependentTemplate,
      customQuery
    };
    
    try {
      sessionStorage.setItem('createDatasetState', JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Error saving dataset creation state:", error);
    }
  }, [
    currentStep,
    datasetType,
    selectedSourceId,
    datasetName,
    selectedTemplate,
    selectedDependentTemplate,
    customQuery
  ]);
  
  // Generate preview data based on selected options
  const handleGeneratePreview = async () => {
    setIsPreviewLoading(true);
    setPreviewError(null);
    setPreviewData([]);
    
    try {
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No authenticated session");
      }
      
      let endpoint = '';
      let payload = {};
      
      // Determine endpoint and payload based on dataset type
      if (datasetType === 'predefined') {
        endpoint = '/functions/v1/shopify-extract';
        payload = {
          source_id: selectedSourceId,
          template_name: selectedTemplate,
          preview_only: true,
          limit: 5
        };
      } else if (datasetType === 'dependent') {
        endpoint = '/functions/v1/shopify-dependent';
        payload = {
          source_id: selectedSourceId,
          template_name: selectedDependentTemplate,
          preview_only: true,
          limit: 5
        };
      } else if (datasetType === 'custom') {
        endpoint = '/functions/v1/shopify-extract';
        payload = {
          source_id: selectedSourceId,
          custom_query: customQuery,
          preview_only: true,
          limit: 5
        };
      }
      
      // Make request to the appropriate endpoint
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://eovyjotxecnkqjylwdnj.supabase.co";
      const response = await fetch(`${supabaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate preview");
      }
      
      const data = await response.json();
      
      if (data.results) {
        setPreviewData(data.results);
        if (data.connection_result) {
          setConnectionTestResult({
            success: data.connection_result.success,
            message: data.connection_result.message
          });
        }
      } else {
        toast({
          title: "Warning",
          description: "Preview generated but returned no results",
          variant: "default",
        });
        setPreviewData([]);
      }
    } catch (error: any) {
      console.error("Error generating preview:", error);
      setPreviewError(error.message || "Failed to generate preview");
    } finally {
      setIsPreviewLoading(false);
    }
  };
  
  // Handle submission of the dataset creation
  const handleCreateDataset = async () => {
    try {
      // Validate required fields
      if (!datasetName.trim()) {
        toast({
          title: "Error",
          description: "Dataset name is required",
          variant: "destructive",
        });
        return;
      }
      
      if (!selectedSourceId) {
        toast({
          title: "Error",
          description: "Please select a data source",
          variant: "destructive",
        });
        return;
      }
      
      // Specific validation based on dataset type
      if (datasetType === 'predefined' && !selectedTemplate) {
        toast({
          title: "Error",
          description: "Please select a template",
          variant: "destructive",
        });
        return;
      }
      
      if (datasetType === 'dependent' && !selectedDependentTemplate) {
        toast({
          title: "Error",
          description: "Please select a dependent template",
          variant: "destructive",
        });
        return;
      }
      
      if (datasetType === 'custom' && !customQuery.trim()) {
        toast({
          title: "Error",
          description: "Please provide a custom GraphQL query",
          variant: "destructive",
        });
        return;
      }
      
      // Get the user id from the session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        throw new Error("No authenticated session");
      }
      
      // Build dataset object with the required types
      const dataset = {
        name: datasetName,
        source_id: selectedSourceId,
        user_id: session.user.id,
        extraction_type: datasetType,
        status: "pending",
        progress: 0,
        is_deleted: false
      } as any; // Use 'any' temporarily to add conditional fields
      
      // Add specific fields based on dataset type
      if (datasetType === 'predefined') {
        dataset.template_name = selectedTemplate;
      } else if (datasetType === 'dependent') {
        dataset.template_name = selectedDependentTemplate;
      } else if (datasetType === 'custom') {
        dataset.custom_query = customQuery;
      }
      
      // Insert dataset
      const { data, error } = await supabase
        .from("extractions")
        .insert(dataset)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create dataset: ${error.message}`);
      }
      
      // Clear session storage
      sessionStorage.removeItem('createDatasetState');
      
      // Show success message and redirect
      toast({
        title: "Dataset Created",
        description: "Your dataset has been created successfully",
      });
      
      navigate("/datasets");
      
    } catch (error: any) {
      console.error("Error creating dataset:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create dataset",
        variant: "destructive",
      });
    }
  };
  
  // Navigation helpers
  const goToNext = () => {
    const steps: StepType[] = ['type', 'configuration', 'templates', 'preview'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };
  
  const goToPrevious = () => {
    const steps: StepType[] = ['type', 'configuration', 'templates', 'preview'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };
  
  // Helper for step selector
  const handleSetCurrentStep = (step: string) => {
    setCurrentStep(step as StepType);
  };
  
  // Rendering helpers
  const renderTemplateStep = () => {
    if (datasetType === 'predefined') {
      return (
        <PredefinedDatasetStep
          selectedTemplate={selectedTemplate}
          onSelect={setSelectedTemplate}
        />
      );
    } else if (datasetType === 'dependent') {
      return (
        <DependentDatasetStep
          selectedTemplate={selectedDependentTemplate}
          onSelect={setSelectedDependentTemplate}
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
  
  const renderStepContent = () => {
    switch (currentStep) {
      case 'type':
        return (
          <DatasetTypeStep
            selectedType={datasetType}
            onSelectType={setDatasetType}
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
            isLoading={sourcesLoading}
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
            onRegeneratePreview={handleGeneratePreview}
            sourceId={selectedSourceId}
            connectionTestResult={connectionTestResult}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate("/datasets")}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Create New Dataset</h1>
          
          {selectedSourceName && (
            <Badge variant="outline" className="ml-auto flex items-center gap-1">
              <span className="text-xs text-muted-foreground">Source:</span> 
              <span className="font-medium">{selectedSourceName}</span>
            </Badge>
          )}
        </div>
        
        <p className="text-muted-foreground ml-10">
          {currentStep === 'type' && "Step 1: Select dataset type"}
          {currentStep === 'configuration' && "Step 2: Configure dataset details"}
          {currentStep === 'templates' && "Step 3: Choose data to extract"}
          {currentStep === 'preview' && "Step 4: Preview and create dataset"}
        </p>
      </div>
      
      <StepSelector
        currentStep={currentStep}
        setCurrentStep={handleSetCurrentStep}
        steps={[
          { id: 'type', label: 'Type' },
          { id: 'configuration', label: 'Config' },
          { id: 'templates', label: 'Data Selection' },
          { id: 'preview', label: 'Preview' }
        ]}
      />
      
      <Card className="p-6">
        {renderStepContent()}
        
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={currentStep === 'type' ? () => navigate("/datasets") : goToPrevious}
          >
            {currentStep === 'type' ? 'Cancel' : 'Previous'}
          </Button>
          
          {currentStep === 'preview' ? (
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={handleGeneratePreview}
                disabled={isPreviewLoading}
              >
                Generate Preview
              </Button>
              <Button onClick={handleCreateDataset} className="gap-1">
                <CheckCircle className="h-4 w-4" />
                Create Dataset
              </Button>
            </div>
          ) : (
            <Button onClick={goToNext}>
              Next
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CreateDatasetPage;
