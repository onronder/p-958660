
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import DatasetStepper from "@/components/datasets/DatasetStepper";
import { useCreateDataset } from "@/hooks/useCreateDataset";
import { toast } from "sonner";

const CreateDatasetPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sourceId, datasetType, templateName, resetState } = useCreateDataset(() => {});
  const [isResetting, setIsResetting] = useState(false);
  
  // Get the current step from the URL
  const getCurrentStep = () => {
    const path = location.pathname.split("/").pop();
    
    switch (path) {
      case "source":
        return 0;
      case "type":
        return 1;
      case "details":
        return 2;
      case "preview":
        return 3;
      case "configure":
        return 4;
      default:
        return 0;
    }
  };
  
  // Log state changes for debugging
  useEffect(() => {
    console.log("CreateDatasetPage current path:", location.pathname);
    console.log("CreateDatasetPage state:", { 
      sourceId, 
      datasetType,
      templateName,
      storedSourceId: sessionStorage.getItem('dataset_sourceId'),
      backupSourceId: sessionStorage.getItem('dataset_sourceId_backup'),
      backupDatasetType: sessionStorage.getItem('dataset_datasetType_backup'),
      backupTemplateName: sessionStorage.getItem('dataset_templateName_backup')
    });
    
    // Check for missing state based on current route
    const currentPathSegment = location.pathname.split("/").pop();
    
    // Try to recover state from backup if needed
    const backupSourceId = sessionStorage.getItem('dataset_sourceId_backup');
    const backupDatasetType = sessionStorage.getItem('dataset_datasetType_backup');
    const backupTemplateName = sessionStorage.getItem('dataset_templateName_backup');
    
    const effectiveSourceId = sourceId || backupSourceId && JSON.parse(backupSourceId);
    const effectiveDatasetType = datasetType || backupDatasetType && JSON.parse(backupDatasetType);
    const effectiveTemplateName = templateName || backupTemplateName && JSON.parse(backupTemplateName);
    
    // Redirect logic based on current path and missing state
    if (currentPathSegment === "type" && !effectiveSourceId) {
      console.log("Missing sourceId for type step, redirecting to source selection");
      toast.error("Please select a data source first");
      setTimeout(() => navigate("/create-dataset/source"), 100);
      return;
    }
    
    if (currentPathSegment === "details" && (!effectiveSourceId || !effectiveDatasetType)) {
      console.log("Missing required state for details step, redirecting");
      
      if (!effectiveSourceId) {
        toast.error("Please select a data source first");
        setTimeout(() => navigate("/create-dataset/source"), 100);
      } else if (!effectiveDatasetType) {
        toast.error("Please select a dataset type");
        setTimeout(() => navigate("/create-dataset/type"), 100);
      }
      return;
    }
    
    if (currentPathSegment === "preview" && 
        (!effectiveSourceId || !effectiveDatasetType || 
         (effectiveDatasetType !== "custom" && !effectiveTemplateName))) {
      console.log("Missing required state for preview step, redirecting");
      
      if (!effectiveSourceId) {
        toast.error("Please select a data source first");
        setTimeout(() => navigate("/create-dataset/source"), 100);
      } else if (!effectiveDatasetType) {
        toast.error("Please select a dataset type");
        setTimeout(() => navigate("/create-dataset/type"), 100);
      } else if (effectiveDatasetType !== "custom" && !effectiveTemplateName) {
        toast.error("Please select a template");
        setTimeout(() => navigate("/create-dataset/details"), 100);
      }
      return;
    }
    
    if (currentPathSegment === "configure" && 
        (!effectiveSourceId || !effectiveDatasetType || 
         (effectiveDatasetType !== "custom" && !effectiveTemplateName))) {
      console.log("Missing required state for configure step, redirecting");
      
      if (!effectiveSourceId) {
        toast.error("Please select a data source first");
        setTimeout(() => navigate("/create-dataset/source"), 100);
      } else if (!effectiveDatasetType) {
        toast.error("Please select a dataset type");
        setTimeout(() => navigate("/create-dataset/type"), 100);
      } else if (effectiveDatasetType !== "custom" && !effectiveTemplateName) {
        toast.error("Please select a template");
        setTimeout(() => navigate("/create-dataset/details"), 100);
      }
    }
  }, [location.pathname, sourceId, datasetType, templateName, navigate]);
  
  const handleCancel = () => {
    setIsResetting(true);
    resetState();
    setTimeout(() => {
      navigate("/my-datasets");
      setIsResetting(false);
    }, 100);
  };
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Create New Dataset</h1>
        <button 
          onClick={handleCancel}
          disabled={isResetting}
          className="text-sm text-muted-foreground hover:text-primary disabled:opacity-50"
        >
          {isResetting ? "Cancelling..." : "Cancel and return"}
        </button>
      </div>
      
      <DatasetStepper currentStep={getCurrentStep()} />
      
      <Card className="p-6">
        <Outlet />
      </Card>
    </div>
  );
};

export default CreateDatasetPage;
