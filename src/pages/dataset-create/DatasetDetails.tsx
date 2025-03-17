
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateDataset } from "@/hooks/useCreateDataset";
import DatasetDetailsHeader from "@/components/datasets/templates/DatasetDetailsHeader";
import PredefinedTemplatesList from "@/components/datasets/templates/PredefinedTemplatesList";
import DependentTemplatesList from "@/components/datasets/templates/DependentTemplatesList";
import CustomQueryEditor from "@/components/datasets/templates/CustomQueryEditor";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

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
  
  const [activeTab, setActiveTab] = useState<"predefined" | "dependent" | "custom">("predefined");
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  
  // Set active tab based on dataset type and log on mount
  useEffect(() => {
    console.log("DatasetDetails mounted with state:", {
      sourceId,
      datasetType,
      templateName,
      storedDatasetType: sessionStorage.getItem('dataset_datasetType'),
      backupDatasetType: sessionStorage.getItem('dataset_datasetType_backup'),
      backupTemplateName: sessionStorage.getItem('dataset_templateName_backup')
    });
    
    // Try to recover datasetType from backup if needed
    let effectiveDatasetType = datasetType;
    if (!effectiveDatasetType) {
      const backupType = sessionStorage.getItem('dataset_datasetType_backup') as "predefined" | "dependent" | "custom" | null;
      if (backupType) {
        console.log("Recovered dataset type from backup:", backupType);
        effectiveDatasetType = backupType;
      }
    }
    
    if (effectiveDatasetType) {
      setActiveTab(effectiveDatasetType);
    }

    // Initialize local state with current template name
    if (templateName) {
      setSelectedTemplate(templateName);
    } else {
      // Try to recover from backup
      const backupTemplateName = sessionStorage.getItem('dataset_templateName_backup');
      if (backupTemplateName) {
        try {
          const parsedName = JSON.parse(backupTemplateName);
          setSelectedTemplate(parsedName);
          // Also set in the main state
          setTemplateName(parsedName);
        } catch (e) {
          console.error("Error parsing template name from backup:", e);
        }
      }
    }
  }, [datasetType, sourceId, templateName, setTemplateName]);
  
  // Check if source and type are selected, if not redirect
  useEffect(() => {
    const checkRequiredState = () => {
      // Check source ID first
      if (!sourceId) {
        const backupSourceId = sessionStorage.getItem('dataset_sourceId_backup');
        if (!backupSourceId) {
          console.log("No source ID found, redirecting to source selection");
          toast.error("Please select a data source first");
          navigate("/create-dataset/source");
          return;
        }
      }
      
      // Then check dataset type
      if (!datasetType) {
        const backupType = sessionStorage.getItem('dataset_datasetType_backup');
        if (!backupType) {
          console.log("No dataset type found, redirecting to type selection");
          toast.error("Please select a dataset type");
          navigate("/create-dataset/type");
          return;
        }
      }
    };
    
    checkRequiredState();
  }, [sourceId, datasetType, navigate]);
  
  const handleBack = () => {
    navigate("/create-dataset/type");
  };
  
  const handleNext = () => {
    if (canProceed()) {
      setIsNavigating(true);
      
      // Update template name in global state
      if (activeTab === "predefined" || activeTab === "dependent") {
        setTemplateName(selectedTemplate);
        
        // Ensure the template name is also stored in session storage
        sessionStorage.setItem('dataset_templateName_backup', JSON.stringify(selectedTemplate));
      }
      
      // Ensure we have the backup values in session storage
      if (datasetType) {
        sessionStorage.setItem('dataset_datasetType_backup', datasetType);
      }
      
      if (customQuery) {
        sessionStorage.setItem('dataset_customQuery_backup', JSON.stringify(customQuery));
      }
      
      console.log("Proceeding to next step with template:", selectedTemplate);
      
      setTimeout(() => {
        navigate("/create-dataset/preview");
      }, 100);
    } else {
      if (activeTab === "predefined" || activeTab === "dependent") {
        toast.error("Please select a template");
      } else {
        toast.error("Please enter a custom query");
      }
    }
  };
  
  const canProceed = () => {
    if (activeTab === "predefined" || activeTab === "dependent") {
      return !!selectedTemplate;
    } else if (activeTab === "custom") {
      return !!customQuery;
    }
    return false;
  };

  // Handle local template selection
  const handleTemplateSelect = (templateName: string) => {
    console.log("Template selected:", templateName);
    setSelectedTemplate(templateName);
  };
  
  // If there's no source or dataset type selected, show a minimal UI while redirecting
  if (!sourceId || !datasetType) {
    const backupSourceId = sessionStorage.getItem('dataset_sourceId_backup');
    const backupDatasetType = sessionStorage.getItem('dataset_datasetType_backup');
    
    if (!backupSourceId || !backupDatasetType) {
      return (
        <div className="p-8 text-center">
          <p>Missing required information. Redirecting...</p>
        </div>
      );
    }
  }
  
  return (
    <div className="space-y-6">
      <DatasetDetailsHeader datasetType={activeTab} />
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "predefined" | "dependent" | "custom")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predefined">Predefined</TabsTrigger>
          <TabsTrigger value="dependent">Dependent</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>
        
        <TabsContent value="predefined" className="pt-4">
          <PredefinedTemplatesList 
            selectedTemplate={selectedTemplate} 
            onSelectTemplate={handleTemplateSelect}
          />
        </TabsContent>
        
        <TabsContent value="dependent" className="pt-4">
          <DependentTemplatesList 
            selectedTemplate={selectedTemplate} 
            onSelectTemplate={handleTemplateSelect}
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
          disabled={isNavigating}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!canProceed() || isNavigating}
        >
          {isNavigating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : "Next Step"}
        </Button>
      </div>
    </div>
  );
};

export default DatasetDetails;
