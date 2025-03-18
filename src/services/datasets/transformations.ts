
import { Dataset, UserDataset } from '@/types/dataset';

/**
 * Transforms a database user_dataset record to the Dataset interface format
 */
export const transformDbRecordToDataset = (dbRecord: any): Dataset => {
  // Safely handle query_params
  let customQuery: string | undefined;
  if (dbRecord.query_params) {
    if (typeof dbRecord.query_params === 'object' && !Array.isArray(dbRecord.query_params)) {
      // If it's an object, try to access query property
      customQuery = 'query' in dbRecord.query_params ? String(dbRecord.query_params.query) : undefined;
    } else if (typeof dbRecord.query_params === 'string') {
      // If it's a string, use it directly
      customQuery = dbRecord.query_params;
    }
  }
  
  // Safely handle result_data - always ensure it's an array
  let resultData: any[] = [];
  if (dbRecord.result_data) {
    resultData = Array.isArray(dbRecord.result_data) ? dbRecord.result_data : [dbRecord.result_data];
  }

  return {
    id: dbRecord.id,
    user_id: dbRecord.user_id,
    source_id: dbRecord.source_id,
    name: dbRecord.name,
    extraction_type: dbRecord.dataset_type as "predefined" | "dependent" | "custom",
    template_name: dbRecord.description || undefined,
    custom_query: customQuery,
    status: dbRecord.status as "pending" | "running" | "completed" | "failed",
    progress: 100, // Default to 100%
    status_message: dbRecord.error_message || undefined,
    result_data: resultData,
    record_count: dbRecord.record_count || 0,
    created_at: dbRecord.created_at,
    updated_at: dbRecord.last_updated,
    is_deleted: Boolean(dbRecord.is_deleted || false)
  };
};

/**
 * Transforms a Dataset interface to database user_dataset record format
 */
export const transformDatasetToDbRecord = (datasetData: Partial<Dataset>): any => {
  return {
    user_id: datasetData.user_id,
    source_id: datasetData.source_id,
    name: datasetData.name,
    dataset_type: datasetData.extraction_type,
    description: datasetData.template_name,
    query_params: datasetData.custom_query ? { query: datasetData.custom_query } : null,
    status: datasetData.status || 'pending',
    error_message: datasetData.status_message,
    record_count: datasetData.record_count,
    result_data: datasetData.result_data || [],
    is_deleted: datasetData.is_deleted || false
  };
};
