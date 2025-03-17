
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCreateDataset } from "@/hooks/useCreateDataset";
import { supabase } from "@/integrations/supabase/client";
import SourceSelectionStep from "@/components/datasets/wizard/SourceSelectionStep";
import DatasetTypeStep from "@/components/datasets/wizard/DatasetTypeStep";
import PredefinedDatasetStep from "@/components/datasets/wizard/PredefinedDatasetStep";
import DependentDatasetStep from "@/components/datasets/wizard/DependentDatasetStep";
import CustomDatasetStep from "@/components/datasets/wizard/CustomDatasetStep";
import DataPreviewStep from "@/components/datasets/wizard/DataPreviewStep";
import ConfigurationStep from "@/components/datasets/wizard/ConfigurationStep";

interface CreateDatasetWizardProps {
  open: boolean;
  onClose: (success?: boolean) => void;
}

const CreateDatasetWizard: React.FC<CreateDatasetWizardProps> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState("source");
  const [selectedTab, setSelectedTab] = useState("predefined");
  
  const {
    sourceId,
    sourceName,
    datasetType,
    templateName,
    customQuery,
    name,
    previewData,
    isSubmitting,
    isLoading,
    setSourceId,
    setSourceName,
    setDatasetType,
    setTemplateName,
    setCustomQuery,
    setName,
    setPreviewData,
    generatePreview,
    createDataset,
    resetState,
    sources,
  } = useCreateDataset(onClose);
  
  // Reset state when modal is closed
  useEffect(() => {
    if (!open) {
      resetState();
    }
  }, [open, resetState]);
  
  const handleSourceSelect = (id: string, name: string) => {
    setSourceId(id);
    setSourceName(name);
    setActiveStep("type");
  };
  
  const handleDatasetTypeSelect = (type: "predefined" | "dependent" | "custom") => {
    setDatasetType(type);
    setSelectedTab(type);
    setActiveStep("details");
  };
  
  const handleNext = () => {
    if (activeStep === "details") {
      setActiveStep("preview");
      // Generate preview based on selected dataset type
      generatePreview();
    } else if (activeStep === "preview") {
      setActiveStep("configuration");
    }
  };
  
  const handleBack = () => {
    if (activeStep === "configuration") {
      setActiveStep("preview");
    } else if (activeStep === "preview") {
      setActiveStep("details");
    } else if (activeStep === "details") {
      setActiveStep("type");
    } else if (activeStep === "type") {
      setActiveStep("source");
    }
  };
  
  const canProceedFromDetails = () => {
    if (datasetType === "predefined" || datasetType === "dependent") {
      return !!templateName;
    } else if (datasetType === "custom") {
      return !!customQuery;
    }
    return false;
  };
  
  const canProceedFromConfig = () => {
    return !!name;
  };
  
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Dataset</DialogTitle>
          <DialogDescription>
            Extract data from your connected sources with predefined templates, dependent queries, or custom queries.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {activeStep === "source" && (
            <SourceSelectionStep 
              sources={sources}
              onSelectSource={handleSourceSelect}
              selectedSourceId={sourceId}
            />
          )}
          
          {activeStep === "type" && (
            <DatasetTypeStep 
              onSelectType={handleDatasetTypeSelect}
              selectedType={datasetType}
            />
          )}
          
          {activeStep === "details" && (
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="predefined">Predefined</TabsTrigger>
                <TabsTrigger value="dependent">Dependent</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
              
              <TabsContent value="predefined">
                <PredefinedDatasetStep 
                  selectedTemplate={templateName}
                  onSelectTemplate={setTemplateName}
                />
              </TabsContent>
              
              <TabsContent value="dependent">
                <DependentDatasetStep 
                  selectedTemplate={templateName}
                  onSelectTemplate={setTemplateName}
                />
              </TabsContent>
              
              <TabsContent value="custom">
                <CustomDatasetStep 
                  sourceId={sourceId}
                  query={customQuery}
                  onQueryChange={setCustomQuery}
                />
              </TabsContent>
            </Tabs>
          )}
          
          {activeStep === "preview" && (
            <DataPreviewStep 
              isLoading={isLoading}
              previewData={previewData}
              onRegeneratePreview={generatePreview}
            />
          )}
          
          {activeStep === "configuration" && (
            <ConfigurationStep 
              name={name}
              onNameChange={setName}
            />
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
          {activeStep !== "source" && (
            <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
          )}
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onClose()} disabled={isSubmitting}>
              Cancel
            </Button>
            
            {activeStep !== "configuration" ? (
              <Button 
                onClick={handleNext} 
                disabled={
                  (activeStep === "details" && !canProceedFromDetails()) ||
                  isLoading ||
                  isSubmitting
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Next"
                )}
              </Button>
            ) : (
              <Button 
                onClick={createDataset} 
                disabled={!canProceedFromConfig() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Dataset"
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDatasetWizard;
