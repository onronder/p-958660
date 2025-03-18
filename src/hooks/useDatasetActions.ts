
import { Dataset } from "@/types/dataset";
import { toast } from "@/hooks/use-toast";
import { deleteDataset, restoreDataset, permanentlyDeleteDataset } from "@/services/datasets";

export const useDatasetActions = (onDatasetsUpdated: () => void) => {
  const handleRunDataset = async (dataset: Dataset) => {
    toast({
      title: "Dataset Processing Started",
      description: `Processing dataset "${dataset.name}" now...`,
    });
    
    // This would typically call an API to start processing the dataset
    console.log("Starting dataset processing:", dataset.id);
    
    // After processing starts, refresh the list
    onDatasetsUpdated();
  };

  const handleDeleteDataset = async (datasetId: string, datasetName: string) => {
    if (window.confirm(`Are you sure you want to delete dataset "${datasetName}"?`)) {
      if (await deleteDataset(datasetId)) {
        onDatasetsUpdated();
        toast({
          title: "Dataset Deleted",
          description: `The dataset "${datasetName}" has been moved to deleted datasets.`,
        });
      }
    }
  };
  
  const handleRestoreDataset = async (datasetId: string) => {
    const restoredDataset = await restoreDataset(datasetId);
    if (restoredDataset) {
      onDatasetsUpdated();
      toast({
        title: "Dataset Restored",
        description: `The dataset "${restoredDataset.name}" has been restored successfully.`,
      });
    }
  };
  
  const handlePermanentDelete = async (datasetId: string) => {
    if (window.confirm("Are you sure you want to permanently delete this dataset? This action cannot be undone.")) {
      const success = await permanentlyDeleteDataset(datasetId);
      if (success) {
        onDatasetsUpdated();
        toast({
          title: "Dataset Permanently Deleted",
          description: "The dataset has been permanently deleted from the system.",
        });
      }
    }
  };

  return {
    handleRunDataset,
    handleDeleteDataset,
    handleRestoreDataset,
    handlePermanentDelete
  };
};
