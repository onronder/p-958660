
import { supabase } from '@/integrations/supabase/client';
import { Dataset } from '@/types/dataset';
import { transformDbRecordToDataset } from './transformations';

// Define a type to match the database structure exactly
type DbDatasetRecord = {
  id: string;
  user_id: string;
  source_id: string;
  name: string;
  dataset_type: string;
  description: string | null;
  query_params: any;
  status: string;
  error_message: string | null;
  record_count: number | null;
  result_data: any;
  created_at: string;
  last_updated: string;
  is_deleted: boolean | null;
};

/**
 * Fetches all active datasets for the current user
 */
export const fetchUserDatasets = async (): Promise<Dataset[]> => {
  try {
    // Use type assertion to bypass TypeScript's deep type inference
    const response = await supabase
      .from('user_datasets')
      .select('id, user_id, source_id, name, dataset_type, description, query_params, status, error_message, record_count, result_data, created_at, last_updated, is_deleted')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });
    
    const { data, error } = response as unknown as { 
      data: DbDatasetRecord[] | null; 
      error: any 
    };

    if (error) {
      console.error('Error fetching datasets:', error);
      throw new Error('Failed to fetch datasets');
    }

    // Transform the data to match Dataset type
    const datasets: Dataset[] = (data || []).map(transformDbRecordToDataset);
    return datasets;
  } catch (error) {
    console.error('Error in fetchUserDatasets:', error);
    // Fall back to fetching without filter and then filtering in memory
    const response = await supabase
      .from('user_datasets')
      .select('id, user_id, source_id, name, dataset_type, description, query_params, status, error_message, record_count, result_data, created_at, last_updated, is_deleted')
      .order('created_at', { ascending: false });
    
    const { data, error: fallbackError } = response as unknown as {
      data: DbDatasetRecord[] | null;
      error: any;
    };
    
    if (fallbackError) {
      console.error('Error in fallback fetch:', fallbackError);
      throw new Error('Failed to fetch datasets');
    }
    
    // Transform and filter out deleted items
    const datasets: Dataset[] = (data || [])
      .map(transformDbRecordToDataset)
      .filter(dataset => !dataset.is_deleted);
    
    return datasets;
  }
};

/**
 * Fetches all deleted (trashed) datasets for the current user
 */
export const fetchDeletedDatasets = async (): Promise<Dataset[]> => {
  try {
    // Use type assertion to bypass TypeScript's deep type inference
    const response = await supabase
      .from('user_datasets')
      .select('id, user_id, source_id, name, dataset_type, description, query_params, status, error_message, record_count, result_data, created_at, last_updated, is_deleted')
      .eq('is_deleted', true)
      .order('created_at', { ascending: false });
    
    const { data, error } = response as unknown as {
      data: DbDatasetRecord[] | null;
      error: any;
    };

    if (error) {
      console.error('Error fetching deleted datasets:', error);
      throw new Error('Failed to fetch deleted datasets');
    }

    // Transform the data to match Dataset type
    const datasets: Dataset[] = (data || []).map(transformDbRecordToDataset);
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
  // Use type assertion to bypass TypeScript's deep type inference
  const response = await supabase
    .from('user_datasets')
    .select('id, user_id, source_id, name, dataset_type, description, query_params, status, error_message, record_count, result_data, created_at, last_updated, is_deleted')
    .eq('id', datasetId)
    .single();
  
  const { data, error } = response as unknown as {
    data: DbDatasetRecord | null;
    error: any;
  };

  if (error) {
    console.error('Error fetching dataset:', error);
    throw new Error('Failed to fetch dataset');
  }

  return transformDbRecordToDataset(data);
};
