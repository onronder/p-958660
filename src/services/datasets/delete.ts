
import { supabase } from '@/integrations/supabase/client';

/**
 * Soft deletes a dataset (moves to trash)
 */
export const deleteDataset = async (datasetId: string): Promise<void> => {
  // Mark the dataset as deleted and track when it was deleted
  const { error } = await supabase
    .from('user_datasets')
    .update({ 
      is_deleted: true,
      deletion_marked_at: new Date().toISOString()
    })
    .eq('id', datasetId);

  if (error) {
    console.error('Error deleting dataset:', error);
    throw new Error('Failed to delete dataset');
  }
};

/**
 * Restores a dataset from trash
 */
export const restoreDataset = async (datasetId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_datasets')
    .update({ 
      is_deleted: false,
      deletion_marked_at: null
    })
    .eq('id', datasetId);

  if (error) {
    console.error('Error restoring dataset:', error);
    throw new Error('Failed to restore dataset');
  }
};

/**
 * Permanently deletes a dataset
 */
export const permanentlyDeleteDataset = async (datasetId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_datasets')
    .delete()
    .eq('id', datasetId);

  if (error) {
    console.error('Error permanently deleting dataset:', error);
    throw new Error('Failed to permanently delete dataset');
  }
};
