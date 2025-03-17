
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCreateDataset } from "@/hooks/useCreateDataset";
import SourceSelectionStep from "@/components/datasets/wizard/SourceSelectionStep";
import { toast } from "sonner";

const DatasetSourceSelect = () => {
  const navigate = useNavigate();
  const { 
    sources, 
    sourceId, 
    handleSourceSelect,
    testConnection,
    connectionTestResult
  } = useCreateDataset(() => {});
  
  const handleNext = () => {
    if (sourceId) {
      console.log("Navigating to dataset type selection with sourceId:", sourceId);
      navigate("/create-dataset/type");
    } else {
      toast.error("Please select a data source first");
    }
  };

  // Log when component mounts to help with debugging
  useEffect(() => {
    console.log("DatasetSourceSelect mounted with sourceId:", sourceId);
  }, [sourceId]);
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Select Data Source</h2>
        <p className="text-muted-foreground mt-1">
          Choose a data source to create a dataset from.
        </p>
      </div>
      
      <SourceSelectionStep
        sources={sources}
        selectedSourceId={sourceId}
        onSelectSource={(id, name) => {
          console.log("Source selected:", id, name);
          handleSourceSelect(id, name);
        }}
        onTestConnection={testConnection}
      />
      
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleNext}
          disabled={!sourceId}
        >
          Next Step
        </Button>
      </div>
    </div>
  );
};

export default DatasetSourceSelect;
