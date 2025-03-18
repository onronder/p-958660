
import { supabase } from '@/integrations/supabase/client';
import { Dataset } from '@/types/dataset';
import { transformDbRecordToDataset } from './transformations';

/**
 * Updates an existing dataset
 */
export const updateDataset = async (datasetId: string, updates: Partial<Dataset>): Promise<Dataset> => {
  // Convert Dataset type updates to DB schema
  const dbUpdates: Record<string, any> = {};
  
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.extraction_type) dbUpdates.dataset_type = updates.extraction_type;
  if (updates.template_name) dbUpdates.description = updates.template_name;
  if (updates.custom_query) dbUpdates.query_params = { query: updates.custom_query };
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.status_message) dbUpdates.error_message = updates.status_message;
  if (updates.result_data) dbUpdates.result_data = updates.result_data;
  if (updates.record_count !== undefined) dbUpdates.record_count = updates.record_count;
  if (updates.is_deleted !== undefined) dbUpdates.is_deleted = updates.is_deleted;

  const { data, error } = await supabase
    .from('user_datasets')
    .update(dbUpdates)
    .eq('id', datasetId)
    .select()
    .single();

  if (error) {
    console.error('Error updating dataset:', error);
    throw new Error('Failed to update dataset');
  }

  return transformDbRecordToDataset(data);
};
