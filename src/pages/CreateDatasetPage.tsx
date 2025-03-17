
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import DatasetStepper from "@/components/datasets/DatasetStepper";
import { useCreateDataset } from "@/hooks/useCreateDataset";

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
  
  // Force the correct route based on state
  useEffect(() => {
    const currentPath = location.pathname.split("/").pop();
    
    // If on details page without a data type, redirect to type selection
    if (currentPath === "details" && !datasetType) {
      navigate("/create-dataset/type");
    }
    
    // If on preview or configure page without a source, redirect to source selection
    if ((currentPath === "preview" || currentPath === "configure") && !sourceId) {
      navigate("/create-dataset/source");
    }
  }, [location.pathname, sourceId, datasetType, navigate]);
  
  // Reset state when component unmounts
  useEffect(() => {
    return () => {
      resetState();
    };
  }, []);
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Create New Dataset</h1>
        <button 
          onClick={() => navigate("/my-datasets")}
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
