
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Plus, Download, PlayCircle, Trash } from "lucide-react";
import InfoBanner from "@/components/InfoBanner";
import HelpFloatingButton from "@/components/help/HelpFloatingButton";
import DatasetsHeader from "@/components/datasets/DatasetsHeader";
import DatasetList from "@/components/datasets/DatasetList";
import EmptyDatasetsState from "@/components/datasets/EmptyDatasetsState";
import { useDatasets } from "@/hooks/useDatasets";
import { useAuth } from "@/contexts/AuthContext";
import CreateDatasetWizard from "@/components/datasets/CreateDatasetWizard";

const MyDatasets = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    datasets, 
    isLoading,
    isError,
    loadDatasets,
    deleteDataset,
    runDataset
  } = useDatasets();
  
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  
  useEffect(() => {
    loadDatasets();
  }, []);
  
  const handleCreateDataset = () => {
    setShowCreateWizard(true);
  };
  
  const handleWizardClose = (success = false) => {
    setShowCreateWizard(false);
    if (success) {
      loadDatasets();
    }
  };
  
  const handleDownload = async (datasetId: string, format = "json") => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-dataset-results`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          extraction_id: datasetId,
          format
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download dataset: ${response.statusText}`);
      }
      
      // Create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      
      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filenameMatch = contentDisposition && contentDisposition.match(/filename="(.+)"/);
      const filename = filenameMatch ? filenameMatch[1] : `dataset-${datasetId}.${format}`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      // Handle the error (you could show a toast notification here)
    }
  };
  
  return (
    <div className="space-y-8">
      <InfoBanner 
        messageId="datasets-info"
        message={
          <span>
            <span className="font-bold">⚡ MyDatasets</span> allows you to create, manage, and export data from your connected sources. Extract data using predefined templates, complex dependent queries, or custom queries.
          </span>
        }
      />
      
      <DatasetsHeader 
        onCreateDataset={handleCreateDataset}
        onRefresh={loadDatasets}
      />
      
      {isError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load datasets. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">My Datasets</h3>
        
        {datasets.length === 0 && !isLoading ? (
          <EmptyDatasetsState onCreateDataset={handleCreateDataset} />
        ) : (
          <DatasetList 
            datasets={datasets}
            isLoading={isLoading}
            onDownload={handleDownload}
            onRun={runDataset}
            onDelete={deleteDataset}
          />
        )}
      </Card>
      
      {showCreateWizard && (
        <CreateDatasetWizard 
          open={showCreateWizard}
          onClose={handleWizardClose}
        />
      )}
      
      <HelpFloatingButton />
    </div>
  );
};

export default MyDatasets;
