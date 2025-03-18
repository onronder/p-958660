
import React from 'react';
import DatasetsTable from './DatasetsTable';
import { Dataset } from '@/types/dataset';
import { useAuth } from '@/contexts/AuthContext';
import { useDatasetActions } from '@/hooks/useDatasetActions';
import DeleteDatasetDialog from './DeleteDatasetDialog';

interface DatasetsListProps {
  datasets: Dataset[];
  isLoading?: boolean;
  onRunDataset?: (datasetId: string) => Promise<void>;
  onDeleteDataset?: (datasetId: string) => Promise<void>;
  onRefresh?: () => void;
}

export const DatasetsList: React.FC<DatasetsListProps> = ({ 
  datasets, 
  isLoading,
  onRunDataset,
  onDeleteDataset,
  onRefresh
}) => {
  const { user } = useAuth();
  const [datasetToDelete, setDatasetToDelete] = React.useState<Dataset | null>(null);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const datasetActions = useDatasetActions();
  
  const handleDelete = async (datasetId: string, datasetName: string) => {
    // Find the dataset to delete
    const dataset = datasets.find(d => d.id === datasetId);
    if (dataset) {
      setDatasetToDelete(dataset);
      setShowDeleteModal(true);
    }
  };
  
  const confirmDelete = async () => {
    if (!datasetToDelete) return;
    
    const success = await datasetActions.handleDelete(datasetToDelete.id, datasetToDelete.name);
    
    if (success && onRefresh) {
      onRefresh();
    }
    
    setShowDeleteModal(false);
    setDatasetToDelete(null);
  };
  
  return (
    <>
      <DatasetsTable 
        datasets={datasets}
        isLoading={isLoading}
        onDelete={handleDelete}
        onRun={onRunDataset}
      />
      
      {datasetToDelete && (
        <DeleteDatasetDialog 
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
          onConfirm={confirmDelete}
          datasetName={datasetToDelete.name}
          isDeleting={datasetActions.isDeleting}
        />
      )}
    </>
  );
};

export default DatasetsList;
