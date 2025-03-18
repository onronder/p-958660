
import { supabase } from '@/integrations/supabase/client';
import { Dataset } from '@/types/dataset';
import { transformDatasetToDbRecord, transformDbRecordToDataset } from './transformations';

/**
 * Creates a new dataset
 */
export const createDataset = async (datasetData: Partial<Dataset>): Promise<Dataset> => {
  // Convert Dataset type to DB schema
  const dbData = transformDatasetToDbRecord(datasetData);

  const { data, error } = await supabase
    .from('user_datasets')
    .insert([dbData])
    .select()
    .single();

  if (error) {
    console.error('Error creating dataset:', error);
    throw new Error('Failed to create dataset');
  }

  // Transform the returned data to match Dataset type
  return transformDbRecordToDataset(data);
};
