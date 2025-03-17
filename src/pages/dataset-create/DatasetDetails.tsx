
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateDataset } from "@/hooks/useCreateDataset";
import DatasetDetailsHeader from "@/components/datasets/templates/DatasetDetailsHeader";
import PredefinedTemplatesList from "@/components/datasets/templates/PredefinedTemplatesList";
import DependentTemplatesList from "@/components/datasets/templates/DependentTemplatesList";
import CustomQueryEditor from "@/components/datasets/templates/CustomQueryEditor";

const DatasetDetails = () => {
  const navigate = useNavigate();
  const { 
    datasetType, 
    templateName, 
    setTemplateName,
    customQuery,
    setCustomQuery,
    sourceId
  } = useCreateDataset(() => {});
  
  const [activeTab, setActiveTab] = useState(datasetType);
  
  // Check if source is selected, if not redirect to source selection
  useEffect(() => {
    if (!sourceId) {
      console.log("No source selected, redirecting to source selection page");
      navigate("/create-dataset/source");
    }
  }, [sourceId, navigate]);
  
  const handleBack = () => {
    navigate("/create-dataset/type");
  };
  
  const handleNext = () => {
    navigate("/create-dataset/preview");
  };
  
  const canProceed = () => {
    if (datasetType === "predefined" || datasetType === "dependent") {
      return !!templateName;
    } else if (datasetType === "custom") {
      return !!customQuery;
    }
    return false;
  };
  
  // If there's no source selected, show a minimal UI while redirecting
  if (!sourceId) {
    return (
      <div className="p-8 text-center">
        <p>No data source selected. Redirecting to source selection...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <DatasetDetailsHeader datasetType={datasetType} />
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "predefined" | "dependent" | "custom")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predefined">Predefined</TabsTrigger>
          <TabsTrigger value="dependent">Dependent</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        
        <TabsContent value="predefined" className="pt-4">
          <PredefinedTemplatesList 
            selectedTemplate={templateName} 
            onSelectTemplate={setTemplateName}
          />
        </TabsContent>
        
        <TabsContent value="dependent" className="pt-4">
          <DependentTemplatesList 
            selectedTemplate={templateName} 
            onSelectTemplate={setTemplateName}
          />
        </TabsContent>
        
        <TabsContent value="custom" className="pt-4">
          <CustomQueryEditor
            customQuery={customQuery}
            setCustomQuery={setCustomQuery}
          />
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between pt-4">
        <Button
          onClick={handleBack}
          variant="outline"
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed()}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default DatasetDetails;
