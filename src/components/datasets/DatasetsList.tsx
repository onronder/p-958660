
import { useState } from "react";
import { Dataset } from "@/types/dataset";
import LoadingState from "./LoadingState";
import EmptyDatasetsState from "./EmptyDatasetsState";
import DatasetsTable from "./DatasetsTable";
import { useDatasetActions } from "@/hooks/useDatasetActions";

interface DatasetsListProps {
  datasets: Dataset[];
  isLoading: boolean;
  onDatasetsUpdated: () => void;
  openCreateDialog: () => void;
  sourcesExist: boolean;
}

const DatasetsList = ({ 
  datasets, 
  isLoading, 
  onDatasetsUpdated, 
  openCreateDialog, 
  sourcesExist 
}: DatasetsListProps) => {
  
  const { 
    handleRunDataset, 
    handleDeleteDataset 
  } = useDatasetActions(onDatasetsUpdated);

  if (isLoading) {
    return <LoadingState />;
  }

  if (datasets.length === 0) {
    return (
      <EmptyDatasetsState 
        sourcesExist={sourcesExist} 
        openCreateDialog={openCreateDialog} 
      />
    );
  }

  return (
    <DatasetsTable 
      datasets={datasets}
      onRunDataset={handleRunDataset}
      onDeleteDataset={handleDeleteDataset}
    />
  );
};

export default DatasetsList;
