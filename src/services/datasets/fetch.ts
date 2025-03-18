
import { supabase } from '@/integrations/supabase/client';
import { Dataset } from '@/types/dataset';
import { transformDbRecordToDataset } from './transformations';

/**
 * Fetches all active datasets for the current user
 */
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

  // Transform the data to match Dataset type
  const datasets: Dataset[] = (data || []).map(transformDbRecordToDataset);
  return datasets;
};

/**
 * Fetches all deleted (trashed) datasets for the current user
 */
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

  // Transform the data to match Dataset type
  const datasets: Dataset[] = (data || []).map(transformDbRecordToDataset);
  return datasets;
};

/**
 * Fetches a single dataset by ID
 */
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

  return transformDbRecordToDataset(data);
};
