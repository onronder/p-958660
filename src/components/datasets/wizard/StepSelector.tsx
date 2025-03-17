
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PredefinedDatasetStep from "./PredefinedDatasetStep";
import DependentDatasetStep from "./DependentDatasetStep";
import CustomDatasetStep from "./CustomDatasetStep";

interface StepSelectorProps {
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  templateName: string;
  setTemplateName: (template: string) => void;
  customQuery: string;
  onQueryChange: (query: string) => void;
  sourceId: string;
}

const StepSelector: React.FC<StepSelectorProps> = ({
  selectedTab,
  setSelectedTab,
  templateName,
  setTemplateName,
  customQuery,
  onQueryChange,
  sourceId
}) => {
  return (
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
          onQueryChange={onQueryChange}
        />
      </TabsContent>
    </Tabs>
  );
};

export default StepSelector;
