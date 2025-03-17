
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateDataset } from "@/hooks/useCreateDataset";
import StepContent from "./wizard/StepContent";
import WizardStepNavigator from "./wizard/WizardStepNavigator";

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
    error,
    setSourceId,
    setSourceName,
    setDatasetType,
    setTemplateName,
    setCustomQuery,
    setName,
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
        
        <StepContent
          activeStep={activeStep}
          sources={sources}
          sourceId={sourceId}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          templateName={templateName}
          customQuery={customQuery}
          name={name}
          previewData={previewData}
          isLoading={isLoading}
          error={error}
          onSelectSource={handleSourceSelect}
          onSelectType={handleDatasetTypeSelect}
          setTemplateName={setTemplateName}
          setCustomQuery={setCustomQuery}
          setName={setName}
          onRegeneratePreview={generatePreview}
          selectedType={datasetType}
        />
        
        <DialogFooter>
          <WizardStepNavigator
            activeStep={activeStep}
            handleBack={handleBack}
            handleNext={handleNext}
            canProceedFromDetails={canProceedFromDetails}
            canProceedFromConfig={canProceedFromConfig}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            createDataset={createDataset}
            onClose={onClose}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDatasetWizard;
