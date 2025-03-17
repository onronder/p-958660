
import React from "react";
import SourceSelectionStep from "./SourceSelectionStep";
import DatasetTypeStep from "./DatasetTypeStep";
import StepSelector from "./StepSelector";
import DataPreviewStep from "./DataPreviewStep";
import ConfigurationStep from "./ConfigurationStep";
import { Source } from "@/types/source";

interface StepContentProps {
  activeStep: string;
  sources: Source[];
  sourceId: string;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  templateName: string;
  customQuery: string;
  name: string;
  previewData: any[];
  isLoading: boolean;
  onSelectSource: (id: string, name: string) => void;
  onSelectType: (type: "predefined" | "dependent" | "custom") => void;
  setTemplateName: (template: string) => void;
  setCustomQuery: (query: string) => void;
  setName: (name: string) => void;
  onRegeneratePreview: () => void;
  selectedType: string;
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
  onSelectSource,
  onSelectType,
  setTemplateName,
  setCustomQuery,
  setName,
  onRegeneratePreview,
  selectedType
}) => {
  return (
    <div className="space-y-6 py-4">
      {activeStep === "source" && (
        <SourceSelectionStep 
          sources={sources}
          onSelectSource={onSelectSource}
          selectedSourceId={sourceId}
        />
      )}
      
      {activeStep === "type" && (
        <DatasetTypeStep 
          onSelectType={onSelectType}
          selectedType={selectedType}
        />
      )}
      
      {activeStep === "details" && (
        <StepSelector
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          templateName={templateName}
          setTemplateName={setTemplateName}
          customQuery={customQuery}
          onQueryChange={setCustomQuery}
          sourceId={sourceId}
        />
      )}
      
      {activeStep === "preview" && (
        <DataPreviewStep 
          isLoading={isLoading}
          previewData={previewData}
          onRegeneratePreview={onRegeneratePreview}
        />
      )}
      
      {activeStep === "configuration" && (
        <ConfigurationStep 
          name={name}
          onNameChange={setName}
        />
      )}
    </div>
  );
};

export default StepContent;
