
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { deleteDataset, restoreDataset, permanentlyDeleteDataset } from '@/services/datasets';

export function useDatasetActions() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async (id: string, name: string) => {
    setIsDeleting(true);
    try {
      const success = await deleteDataset(id);
      if (success) {
        toast({
          title: 'Dataset Deleted',
          description: `Dataset "${name}" has been moved to trash.`,
        });
        return true;
      } else {
        throw new Error('Failed to delete dataset');
      }
    } catch (error) {
      console.error('Error deleting dataset:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete dataset. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestore = async (id: string, name: string) => {
    setIsRestoring(true);
    try {
      const success = await restoreDataset(id);
      if (success) {
        toast({
          title: 'Dataset Restored',
          description: `Dataset "${name}" has been restored.`,
        });
        return true;
      } else {
        throw new Error('Failed to restore dataset');
      }
    } catch (error) {
      console.error('Error restoring dataset:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore dataset. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    setIsDeleting(true);
    try {
      const success = await permanentlyDeleteDataset(id);
      if (success) {
        toast({
          title: 'Dataset Permanently Deleted',
          description: `Dataset "${name}" has been permanently deleted.`,
        });
        return true;
      } else {
        throw new Error('Failed to permanently delete dataset');
      }
    } catch (error) {
      console.error('Error permanently deleting dataset:', error);
      toast({
        title: 'Error',
        description: 'Failed to permanently delete dataset. Please try again.',
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
    handlePermanentDelete,
  };
}
