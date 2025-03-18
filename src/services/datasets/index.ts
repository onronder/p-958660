
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

  // Transform the data to match Dataset type
  const datasets: Dataset[] = (data || []).map(item => ({
    id: item.id,
    user_id: item.user_id,
    source_id: item.source_id,
    name: item.name,
    extraction_type: item.dataset_type as "predefined" | "dependent" | "custom",
    template_name: item.description || undefined,
    custom_query: item.query_params?.query as string | undefined,
    status: item.status as "pending" | "running" | "completed" | "failed",
    progress: 100, // Default to 100%
    status_message: item.error_message || undefined,
    result_data: item.result_data,
    record_count: item.record_count || 0,
    created_at: item.created_at,
    updated_at: item.last_updated,
    is_deleted: false
  }));

  return datasets;
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

  // Transform the data to match Dataset type
  const datasets: Dataset[] = (data || []).map(item => ({
    id: item.id,
    user_id: item.user_id,
    source_id: item.source_id,
    name: item.name,
    extraction_type: item.dataset_type as "predefined" | "dependent" | "custom",
    template_name: item.description || undefined,
    custom_query: item.query_params?.query as string | undefined,
    status: item.status as "pending" | "running" | "completed" | "failed",
    progress: 100, // Default to 100%
    status_message: item.error_message || undefined,
    result_data: item.result_data,
    record_count: item.record_count || 0,
    created_at: item.created_at,
    updated_at: item.last_updated,
    is_deleted: true
  }));

  return datasets;
};

export const createDataset = async (datasetData: Partial<Dataset>): Promise<Dataset> => {
  // Convert Dataset type to DB schema
  const dbData = {
    user_id: datasetData.user_id,
    source_id: datasetData.source_id,
    name: datasetData.name,
    dataset_type: datasetData.extraction_type,
    description: datasetData.template_name,
    query_params: { query: datasetData.custom_query },
    status: datasetData.status || 'pending',
    error_message: datasetData.status_message,
    record_count: datasetData.record_count,
    result_data: datasetData.result_data || []
  };

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
  const dataset: Dataset = {
    id: data.id,
    user_id: data.user_id,
    source_id: data.source_id,
    name: data.name,
    extraction_type: data.dataset_type as "predefined" | "dependent" | "custom",
    template_name: data.description || undefined,
    custom_query: data.query_params?.query as string | undefined,
    status: data.status as "pending" | "running" | "completed" | "failed",
    progress: 0,
    status_message: data.error_message || undefined,
    result_data: data.result_data,
    record_count: data.record_count || 0,
    created_at: data.created_at,
    updated_at: data.last_updated,
    is_deleted: false
  };

  return dataset;
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
  // Convert Dataset type updates to DB schema
  const dbUpdates: any = {};
  
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.extraction_type) dbUpdates.dataset_type = updates.extraction_type;
  if (updates.template_name) dbUpdates.description = updates.template_name;
  if (updates.custom_query) dbUpdates.query_params = { ...dbUpdates.query_params, query: updates.custom_query };
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.status_message) dbUpdates.error_message = updates.status_message;
  if (updates.result_data) dbUpdates.result_data = updates.result_data;
  if (updates.record_count !== undefined) dbUpdates.record_count = updates.record_count;

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

  // Transform the returned data to match Dataset type
  const dataset: Dataset = {
    id: data.id,
    user_id: data.user_id,
    source_id: data.source_id,
    name: data.name,
    extraction_type: data.dataset_type as "predefined" | "dependent" | "custom",
    template_name: data.description || undefined,
    custom_query: data.query_params?.query as string | undefined,
    status: data.status as "pending" | "running" | "completed" | "failed",
    progress: 100,
    status_message: data.error_message || undefined,
    result_data: data.result_data,
    record_count: data.record_count || 0,
    created_at: data.created_at,
    updated_at: data.last_updated,
    is_deleted: false
  };

  return dataset;
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

  // Transform the data to match Dataset type
  const dataset: Dataset = {
    id: data.id,
    user_id: data.user_id,
    source_id: data.source_id,
    name: data.name,
    extraction_type: data.dataset_type as "predefined" | "dependent" | "custom",
    template_name: data.description || undefined,
    custom_query: data.query_params?.query as string | undefined,
    status: data.status as "pending" | "running" | "completed" | "failed",
    progress: 100,
    status_message: data.error_message || undefined,
    result_data: data.result_data,
    record_count: data.record_count || 0,
    created_at: data.created_at,
    updated_at: data.last_updated,
    is_deleted: data.is_deleted || false
  };

  return dataset;
};
