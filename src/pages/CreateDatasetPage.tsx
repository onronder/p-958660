
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import DatasetStepper from "@/components/datasets/DatasetStepper";
import { useCreateDataset } from "@/hooks/useCreateDataset";
import { toast } from "sonner";

const CreateDatasetPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sourceId, datasetType, resetState } = useCreateDataset(() => {});
  
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
      storedSourceId: sessionStorage.getItem('dataset_sourceId'),
      backupSourceId: sessionStorage.getItem('dataset_sourceId_backup'),
      backupDatasetType: sessionStorage.getItem('dataset_datasetType_backup')
    });
    
    // Check for missing state based on current route
    const currentPath = location.pathname.split("/").pop();
    
    // Try to recover sourceId from backup if needed
    const backupSourceId = sessionStorage.getItem('dataset_sourceId_backup');
    const effectiveSourceId = sourceId || backupSourceId;
    
    // Try to recover datasetType from backup if needed
    const backupDatasetType = sessionStorage.getItem('dataset_datasetType_backup');
    const effectiveDatasetType = datasetType || backupDatasetType;
    
    // Redirect logic based on current path and missing state
    if (currentPath === "type" && !effectiveSourceId) {
      console.log("Missing sourceId for type step, redirecting to source selection");
      toast.error("Please select a data source first");
      setTimeout(() => navigate("/create-dataset/source"), 100);
      return;
    }
    
    if (currentPath === "details" && (!effectiveSourceId || !effectiveDatasetType)) {
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
    
    if ((currentPath === "preview" || currentPath === "configure") && 
        (!effectiveSourceId || !effectiveDatasetType)) {
      console.log("Missing required state for current step, redirecting");
      
      if (!effectiveSourceId) {
        toast.error("Please select a data source first");
        setTimeout(() => navigate("/create-dataset/source"), 100);
      } else if (!effectiveDatasetType) {
        toast.error("Please select a dataset type");
        setTimeout(() => navigate("/create-dataset/type"), 100);
      }
    }
  }, [location.pathname, sourceId, datasetType, navigate]);
  
  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      // Don't reset state on unmount - we want to persist it
      // resetState();
    };
  }, []);
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Create New Dataset</h1>
        <button 
          onClick={() => {
            resetState();
            navigate("/my-datasets");
          }}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Cancel and return
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
