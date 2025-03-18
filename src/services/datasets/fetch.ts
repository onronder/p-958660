
import { supabase } from '@/integrations/supabase/client';
import { Dataset } from '@/types/dataset';
import { transformDbRecordToDataset } from './transformations';

/**
 * Fetches all active datasets for the current user
 */
export const fetchUserDatasets = async (): Promise<Dataset[]> => {
  // Explicitly select only needed fields to prevent TypeScript recursion
  const query = supabase
    .from('user_datasets')
    .select('id, user_id, source_id, name, dataset_type, description, query_params, status, error_message, record_count, result_data, created_at, last_updated, is_deleted')
    .order('created_at', { ascending: false });
  
  try {
    // Use as any to bypass TypeScript's type checking for the dynamic property
    const queryWithFilter = query.eq('is_deleted' as any, false);
    const { data, error } = await queryWithFilter;

    if (error) {
      console.error('Error fetching datasets:', error);
      throw new Error('Failed to fetch datasets');
    }

    // Transform the data to match Dataset type
    const datasets: Dataset[] = (data || []).map(transformDbRecordToDataset);
    return datasets;
  } catch (filterError) {
    // Fallback without filter if is_deleted column doesn't exist
    console.warn('Falling back to query without is_deleted filter:', filterError);
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching datasets:', error);
      throw new Error('Failed to fetch datasets');
    }
    
    // Transform the data, filtering out any potentially deleted items
    const datasets: Dataset[] = (data || [])
      .map(transformDbRecordToDataset)
      .filter(dataset => dataset.is_deleted !== true);
    
    return datasets;
  }
};

/**
 * Fetches all deleted (trashed) datasets for the current user
 */
export const fetchDeletedDatasets = async (): Promise<Dataset[]> => {
  // Explicitly select only needed fields to prevent TypeScript recursion
  const query = supabase
    .from('user_datasets')
    .select('id, user_id, source_id, name, dataset_type, description, query_params, status, error_message, record_count, result_data, created_at, last_updated, is_deleted')
    .order('created_at', { ascending: false });
  
  try {
    // Use as any to bypass TypeScript's type checking for the dynamic property
    const queryWithFilter = query.eq('is_deleted' as any, true);
    const { data, error } = await queryWithFilter;

    if (error) {
      console.error('Error fetching deleted datasets:', error);
      throw new Error('Failed to fetch deleted datasets');
    }

    // Transform the data to match Dataset type
    const datasets: Dataset[] = (data || []).map(transformDbRecordToDataset);
    return datasets;
  } catch (filterError) {
    // Fallback without filter if is_deleted column doesn't exist
    console.warn('Falling back to query without is_deleted filter:', filterError);
    return []; // Return empty array for deleted datasets if column doesn't exist
  }
};

/**
 * Fetches a single dataset by ID
 */
export const fetchDatasetById = async (datasetId: string): Promise<Dataset> => {
  // Explicitly select only needed fields to prevent TypeScript recursion
  const { data, error } = await supabase
    .from('user_datasets')
    .select('id, user_id, source_id, name, dataset_type, description, query_params, status, error_message, record_count, result_data, created_at, last_updated, is_deleted')
    .eq('id', datasetId)
    .single();

  if (error) {
    console.error('Error fetching dataset:', error);
    throw new Error('Failed to fetch dataset');
  }

  return transformDbRecordToDataset(data);
};
