
import { supabase } from '@/integrations/supabase/client';
import { Dataset } from '@/types/dataset';
import { transformDbRecordToDataset } from './transformations';

// Define a type to match the database structure exactly with more specific types
// to prevent TypeScript from creating deep recursive type structures
type DbDatasetRecord = {
  id: string;
  user_id: string;
  source_id: string;
  name: string;
  dataset_type: string;
  description: string | null;
  query_params: Record<string, unknown> | null; // More specific than 'any'
  status: string;
  error_message: string | null;
  record_count: number | null;
  result_data: unknown[] | null; // Array of unknown instead of any
  created_at: string;
  last_updated: string;
  is_deleted: boolean | null;
  deletion_marked_at?: string | null;
};

/**
 * Fetches all active datasets for the current user
 */
export const fetchUserDatasets = async (): Promise<Dataset[]> => {
  try {
    // Use explicit casting to prevent TypeScript from deep type inference
    const response = await supabase
      .from('user_datasets')
      .select('id, user_id, source_id, name, dataset_type, description, query_params, status, error_message, record_count, result_data, created_at, last_updated, is_deleted, deletion_marked_at')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    
    if (response.error) {
      console.error('Error fetching datasets:', response.error);
      throw new Error('Failed to fetch datasets');
    }

    // Transform the data to match Dataset type
    const datasets: Dataset[] = (response.data as unknown as DbDatasetRecord[] || []).map(transformDbRecordToDataset);
    return datasets;
  } catch (error) {
    console.error('Error in fetchUserDatasets:', error);
    // Fall back to fetching without filter and then filtering in memory if needed
    try {
      const response = await supabase
        .from('user_datasets')
        .select('id, user_id, source_id, name, dataset_type, description, query_params, status, error_message, record_count, result_data, created_at, last_updated, is_deleted, deletion_marked_at')
        .order('created_at', { ascending: false });
      
      if (response.error) {
        console.error('Error in fallback fetch:', response.error);
        throw new Error('Failed to fetch datasets');
      }
      
      // Transform and filter out deleted items
      const datasets: Dataset[] = (response.data as unknown as DbDatasetRecord[] || [])
        .filter(record => !record.is_deleted)
        .map(transformDbRecordToDataset);
      
      return datasets;
    } catch (innerError) {
      console.error('Error in inner fetchUserDatasets fallback:', innerError);
      return []; // Return empty array in case of error
    }
  }
};

/**
 * Fetches all deleted (trashed) datasets for the current user
 */
export const fetchDeletedDatasets = async (): Promise<Dataset[]> => {
  try {
    const response = await supabase
      .from('user_datasets')
      .select('id, user_id, source_id, name, dataset_type, description, query_params, status, error_message, record_count, result_data, created_at, last_updated, is_deleted, deletion_marked_at')
      .eq('is_deleted', true)
      .order('created_at', { ascending: false });
    
    if (response.error) {
      console.error('Error fetching deleted datasets:', response.error);
      throw new Error('Failed to fetch deleted datasets');
    }

    // Transform the data to match Dataset type
    const datasets: Dataset[] = (response.data as unknown as DbDatasetRecord[] || []).map(transformDbRecordToDataset);
    return datasets;
  } catch (error) {
    console.error('Error in fetchDeletedDatasets:', error);
    return []; // Return empty array for deleted datasets if error occurs
  }
};

/**
 * Fetches a single dataset by ID
 */
export const fetchDatasetById = async (datasetId: string): Promise<Dataset> => {
  const response = await supabase
    .from('user_datasets')
    .select('id, user_id, source_id, name, dataset_type, description, query_params, status, error_message, record_count, result_data, created_at, last_updated, is_deleted, deletion_marked_at')
    .eq('id', datasetId)
    .single();
  
  if (response.error) {
    console.error('Error fetching dataset:', response.error);
    throw new Error('Failed to fetch dataset');
  }

  return transformDbRecordToDataset(response.data as unknown as DbDatasetRecord);
};
