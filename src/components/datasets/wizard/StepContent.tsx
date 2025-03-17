
import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SourceSelectionStep from "./SourceSelectionStep";
import DatasetTypeStep from "./DatasetTypeStep";
import PredefinedDatasetStep from "./PredefinedDatasetStep";
import DependentDatasetStep from "./DependentDatasetStep";
import CustomDatasetStep from "./CustomDatasetStep";
import ConfigurationStep from "./ConfigurationStep";
import DataPreviewStep from "./DataPreviewStep";

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
  error: string | null;
  onSelectSource: (id: string, name: string) => void;
  onSelectType: (type: "predefined" | "dependent" | "custom") => void;
  setTemplateName: (name: string) => void;
  setCustomQuery: (query: string) => void;
  setName: (name: string) => void;
  onRegeneratePreview: () => void;
  selectedType: "predefined" | "dependent" | "custom";
  onTestConnection?: () => void;
  connectionTestResult?: {
    success: boolean;
    message: string;
  };
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
  selectedType,
  onTestConnection,
  connectionTestResult
}) => {
  return (
    <div className="py-4">
      {activeStep === "source" && (
        <SourceSelectionStep 
          sources={sources}
          selectedSourceId={sourceId}
          onSelectSource={onSelectSource}
          onTestConnection={onTestConnection}
        />
      )}
      
      {activeStep === "type" && (
        <DatasetTypeStep onSelectType={onSelectType} />
      )}
      
      {activeStep === "details" && (
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsContent value="predefined" className="mt-0">
            <PredefinedDatasetStep 
              templateName={templateName} 
              onSelectTemplate={setTemplateName}
            />
          </TabsContent>
          <TabsContent value="dependent" className="mt-0">
            <DependentDatasetStep 
              templateName={templateName} 
              onSelectTemplate={setTemplateName}
            />
          </TabsContent>
          <TabsContent value="custom" className="mt-0">
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
          error={error}
          onRegeneratePreview={onRegeneratePreview}
          sourceId={sourceId}
          connectionTestResult={connectionTestResult}
        />
      )}
      
      {activeStep === "configuration" && (
        <ConfigurationStep 
          name={name}
          onNameChange={setName}
          sourceId={sourceId}
          datasetType={selectedType}
          templateName={templateName}
        />
      )}
    </div>
  );
};

export default StepContent;
