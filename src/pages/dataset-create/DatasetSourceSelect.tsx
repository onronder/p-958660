
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
  
  // Log when component mounts to help with debugging
  useEffect(() => {
    console.log("DatasetSourceSelect mounted with sourceId:", sourceId);
    console.log("Session storage sourceId:", sessionStorage.getItem('dataset_sourceId'));
  }, [sourceId]);
  
  const handleNext = () => {
    if (sourceId) {
      console.log("Navigating to dataset type selection with sourceId:", sourceId);
      // Store sourceId in session storage directly as a backup
      sessionStorage.setItem('dataset_sourceId_backup', sourceId);
      
      // Force a direct navigation rather than relying on state updates
      navigate("/create-dataset/type");
    } else {
      toast.error("Please select a data source first");
    }
  };
  
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
      
      {connectionTestResult && connectionTestResult.success && (
        <div className="text-green-600 mt-2 text-sm">
          Connection test successful! You can proceed to the next step.
        </div>
      )}
      
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
