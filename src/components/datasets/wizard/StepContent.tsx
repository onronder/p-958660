
import React from "react";
import SourceSelectionStep from "./SourceSelectionStep";
import DatasetTypeStep from "./DatasetTypeStep";
import PredefinedDatasetStep from "./PredefinedDatasetStep";
import DependentDatasetStep from "./DependentDatasetStep";
import CustomDatasetStep from "./CustomDatasetStep";
import DataPreviewStep from "./DataPreviewStep";
import ConfigurationStep from "./ConfigurationStep";

interface StepContentProps {
  activeStep: string;
  sources: any[];
  sourceId: string;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  templateName: string;
  customQuery: string;
  name: string;
  previewData: any[];
  isLoading: boolean;
  error?: string | null;
  onSelectSource: (id: string, name: string) => void;
  onSelectType: (type: "predefined" | "dependent" | "custom") => void;
  setTemplateName: (name: string) => void;
  setCustomQuery: (query: string) => void;
  setName: (name: string) => void;
  onRegeneratePreview: () => void;
  selectedType: "predefined" | "dependent" | "custom";
}

const StepContent: React.FC<StepContentProps> = ({
  activeStep,
  sources,
  sourceId,
  selectedTab,
  setSelectedTab,
  templateName,
  customQuery,
  name,
  previewData,
  isLoading,
  error,
  onSelectSource,
  onSelectType,
  setTemplateName,
  setCustomQuery,
  setName,
  onRegeneratePreview,
  selectedType
}) => {
  // Check if we need to show source selection due to missing sourceId
  const needsSourceSelection = !sourceId && activeStep !== "source";
  
  // If we need source selection and we're not on the source step, show source selection
  if (needsSourceSelection) {
    return (
      <SourceSelectionStep 
        sources={sources} 
        selectedSourceId={sourceId}
        onSelectSource={onSelectSource} 
      />
    );
  }
  
  // Regular step content based on activeStep
  switch (activeStep) {
    case "source":
      return (
        <SourceSelectionStep 
          sources={sources} 
          selectedSourceId={sourceId}
          onSelectSource={onSelectSource} 
        />
      );
    case "type":
      return (
        <DatasetTypeStep 
          selectedType={selectedType}
          onSelectType={onSelectType} 
        />
      );
    case "details":
      if (selectedTab === "predefined") {
        return (
          <PredefinedDatasetStep 
            selectedTemplate={templateName} 
            onSelectTemplate={setTemplateName} 
          />
        );
      } else if (selectedTab === "dependent") {
        return (
          <DependentDatasetStep 
            selectedTemplate={templateName} 
            onSelectTemplate={setTemplateName} 
          />
        );
      } else {
        return (
          <CustomDatasetStep 
            sourceId={sourceId}
            query={customQuery} 
            onQueryChange={setCustomQuery} 
          />
        );
      }
    case "preview":
      return (
        <DataPreviewStep 
          isLoading={isLoading} 
          previewData={previewData} 
          error={error}
          onRegeneratePreview={onRegeneratePreview}
          sourceId={sourceId} 
        />
      );
    case "configuration":
      return (
        <ConfigurationStep 
          name={name} 
          onNameChange={setName} 
        />
      );
    default:
      return null;
  }
};

export default StepContent;
