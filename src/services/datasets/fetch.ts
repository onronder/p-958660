
import { supabase } from '@/integrations/supabase/client';
import { Dataset } from '@/types/dataset';
import { transformDbRecordToDataset } from './transformations';

/**
 * Fetches all active datasets for the current user
 */
export const fetchUserDatasets = async (): Promise<Dataset[]> => {
  const query = supabase
    .from('user_datasets')
    .select('*')
    .order('created_at', { ascending: false });
  
  // Apply is_deleted filter as a dynamic property to avoid TypeScript errors
  try {
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
    
    // Transform the data to match Dataset type, filtering out any potentially deleted items
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
  const query = supabase
    .from('user_datasets')
    .select('*')
    .order('created_at', { ascending: false });
  
  // Apply is_deleted filter as a dynamic property to avoid TypeScript errors
  try {
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
