
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
  switch (activeStep) {
    case "source":
      return (
        <SourceSelectionStep 
          sources={sources} 
          onSelectSource={onSelectSource} 
        />
      );
    case "type":
      return (
        <DatasetTypeStep 
          onSelectType={onSelectType} 
        />
      );
    case "details":
      if (selectedTab === "predefined") {
        return (
          <PredefinedDatasetStep 
            sourceId={sourceId}
            templateName={templateName} 
            setTemplateName={setTemplateName} 
          />
        );
      } else if (selectedTab === "dependent") {
        return (
          <DependentDatasetStep 
            sourceId={sourceId}
            templateName={templateName} 
            setTemplateName={setTemplateName} 
          />
        );
      } else {
        return (
          <CustomDatasetStep 
            sourceId={sourceId}
            customQuery={customQuery} 
            setCustomQuery={setCustomQuery} 
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
        />
      );
    case "configuration":
      return (
        <ConfigurationStep 
          name={name} 
          setName={setName} 
          selectedType={selectedType}
          templateName={templateName}
        />
      );
    default:
      return null;
  }
};

export default StepContent;
