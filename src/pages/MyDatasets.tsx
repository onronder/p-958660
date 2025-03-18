
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Dataset } from '@/types/dataset';
import { DatasetsList } from '@/components/datasets/DatasetsList';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmptyDatasetsState from '@/components/datasets/EmptyDatasetsState';
import LoadingState from '@/components/datasets/LoadingState';
import CreateDatasetDialog from '@/components/datasets/CreateDatasetDialog';
import DeletedDatasetsTable from '@/components/datasets/DeletedDatasetsTable';
import { fetchUserDatasets, fetchDeletedDatasets } from '@/services/datasets';
import { useDatasetActions } from '@/hooks/useDatasetActions';
import { devLogger } from '@/utils/DevLogger';

// Define props interface for components that were missing them
interface EmptyDatasetsStateProps {
  onCreate: () => void;
}

interface DeletedDatasetsTableProps {
  deletedDatasets: Dataset[];
  isRestoring: boolean;
  isDeleting: boolean;
  onRestore: (id: string, name: string) => Promise<boolean>;
  onDelete: (id: string, name: string) => Promise<boolean>;
}

interface CreateDatasetDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (templateId: string) => void;
}

const MyDatasetsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [deletedDatasets, setDeletedDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const datasetActions = useDatasetActions();

  const loadDatasets = async () => {
    setIsLoading(true);
    try {
      const fetchedDatasets = await fetchUserDatasets();
      setDatasets(fetchedDatasets);
      
      // Also fetch deleted datasets if we're on the trash tab
      if (activeTab === 'trash') {
        const fetchedDeletedDatasets = await fetchDeletedDatasets();
        setDeletedDatasets(fetchedDeletedDatasets);
      }
    } catch (error) {
      console.error('Error loading datasets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load datasets',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDatasets();
    }
  }, [user, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleRestore = async (id: string, name: string) => {
    const success = await datasetActions.handleRestore(id, name);
    if (success) {
      loadDatasets();
    }
    return success;
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    const success = await datasetActions.handlePermanentDelete(id, name);
    if (success) {
      loadDatasets();
    }
    return success;
  };

  const handleCreateDataset = () => {
    setShowCreateDialog(true);
  };

  const onCreateDatasetSubmit = (templateId: string) => {
    navigate(`/create-dataset?template=${templateId}`);
    setShowCreateDialog(false);
  };

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Datasets</h1>
        <Button onClick={handleCreateDataset}>
          <Plus className="h-4 w-4 mr-2" />
          Create Dataset
        </Button>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active Datasets</TabsTrigger>
          <TabsTrigger value="trash">Trash</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {isLoading ? (
            <LoadingState />
          ) : datasets.length === 0 ? (
            <EmptyDatasetsState onCreate={handleCreateDataset} />
          ) : (
            <DatasetsList 
              datasets={datasets} 
              isLoading={isLoading}
              onRefresh={loadDatasets}
            />
          )}
        </TabsContent>

        <TabsContent value="trash">
          {isLoading ? (
            <LoadingState />
          ) : deletedDatasets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">The trash is empty</p>
            </div>
          ) : (
            <DeletedDatasetsTable 
              deletedDatasets={deletedDatasets}
              isRestoring={datasetActions.isRestoring}
              isDeleting={datasetActions.isDeleting}
              onRestore={handleRestore}
              onDelete={handlePermanentDelete}
            />
          )}
        </TabsContent>
      </Tabs>

      <CreateDatasetDialog
        isOpen={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={onCreateDatasetSubmit}
      />
    </div>
  );
};

export default MyDatasetsPage;
