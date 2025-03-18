
import { supabase } from '@/integrations/supabase/client';
import { Dataset } from '@/types/dataset';

export const fetchUserDatasets = async (): Promise<Dataset[]> => {
  const { data, error } = await supabase
    .from('user_datasets')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching datasets:', error);
    throw new Error('Failed to fetch datasets');
  }

  return data || [];
};

export const fetchDeletedDatasets = async (): Promise<Dataset[]> => {
  const { data, error } = await supabase
    .from('user_datasets')
    .select('*')
    .eq('is_deleted', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching deleted datasets:', error);
    throw new Error('Failed to fetch deleted datasets');
  }

  return data || [];
};

export const createDataset = async (datasetData: Partial<Dataset>): Promise<Dataset> => {
  const { data, error } = await supabase
    .from('user_datasets')
    .insert([datasetData])
    .select()
    .single();

  if (error) {
    console.error('Error creating dataset:', error);
    throw new Error('Failed to create dataset');
  }

  return data;
};

export const deleteDataset = async (datasetId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_datasets')
    .update({ is_deleted: true })
    .eq('id', datasetId);

  if (error) {
    console.error('Error deleting dataset:', error);
    throw new Error('Failed to delete dataset');
  }
};

export const restoreDataset = async (datasetId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_datasets')
    .update({ is_deleted: false })
    .eq('id', datasetId);

  if (error) {
    console.error('Error restoring dataset:', error);
    throw new Error('Failed to restore dataset');
  }
};

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

export const updateDataset = async (datasetId: string, updates: Partial<Dataset>): Promise<Dataset> => {
  const { data, error } = await supabase
    .from('user_datasets')
    .update(updates)
    .eq('id', datasetId)
    .select()
    .single();

  if (error) {
    console.error('Error updating dataset:', error);
    throw new Error('Failed to update dataset');
  }

  return data;
};

export const fetchDatasetById = async (datasetId: string): Promise<Dataset> => {
  const { data, error } = await supabase
    .from('user_datasets')
    .select('*')
    .eq('id', datasetId)
    .single();

  if (error) {
    console.error('Error fetching dataset:', error);
    throw new Error('Failed to fetch dataset');
  }

  return data;
};
