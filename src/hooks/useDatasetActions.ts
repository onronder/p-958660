
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useDatasetMutations } from '@/hooks/datasets/queries';

export const useDatasetActions = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const mutations = useDatasetMutations();

  const handleDelete = async (id: string, name: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      await mutations.deleteDataset.mutateAsync(id);
      
      toast({
        title: 'Dataset Deleted',
        description: `${name} has been moved to the trash.`,
      });
      return true;
    } catch (error) {
      console.error('Error deleting dataset:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete dataset.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (id: string, name: string): Promise<boolean> => {
    try {
      setIsRestoring(true);
      await mutations.restoreDataset.mutateAsync(id);
      
      toast({
        title: 'Dataset Restored',
        description: `${name} has been restored.`,
      });
      return true;
    } catch (error) {
      console.error('Error restoring dataset:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore dataset.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePermanentDelete = async (id: string, name: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      await mutations.permanentlyDeleteDataset.mutateAsync(id);
      
      toast({
        title: 'Dataset Permanently Deleted',
        description: `${name} has been permanently deleted.`,
      });
      return true;
    } catch (error) {
      console.error('Error permanently deleting dataset:', error);
      toast({
        title: 'Error',
        description: 'Failed to permanently delete dataset.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    isRestoring,
    handleDelete,
    handleRestore,
    handlePermanentDelete
  };
};
