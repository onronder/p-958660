
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import DatasetStepper from "@/components/datasets/DatasetStepper";
import { useCreateDataset } from "@/hooks/useCreateDataset";

const CreateDatasetPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetState } = useCreateDataset(() => {});
  
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
