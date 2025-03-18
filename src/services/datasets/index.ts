import { supabase } from "@/integrations/supabase/client";
import { Dataset } from "@/types/dataset";
import { useAuth } from "@/contexts/AuthContext";

// Fetch all active datasets
export const fetchDatasets = async (): Promise<Dataset[]> => {
  try {
    const { data, error } = await supabase
      .from("user_datasets")
      .select("*")
      .eq("status", "ready")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching datasets:", error);
      // Return empty array instead of throwing - this handles the table not existing yet
      return [];
    }

    // Type casting with proper mapping to match Dataset interface
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      source_id: item.source_id,
      name: item.name,
      extraction_type: item.dataset_type as "predefined" | "dependent" | "custom",
      template_name: item.description || undefined,
      custom_query: item.query_params && typeof item.query_params === 'object' ? 
                   (item.query_params as any).custom_query : undefined,
      status: mapDatabaseStatus(item.status),
      progress: 100, // Completed datasets are at 100%
      result_data: ensureArrayData(item.result_data),
      record_count: item.record_count || 0,
      created_at: item.created_at,
      updated_at: item.last_updated,
      is_deleted: false,
    }));
  } catch (error) {
    console.error("Error in fetchDatasets:", error);
    return [];
  }
};

// Helper function to ensure result_data is an array
const ensureArrayData = (data: any): any[] => {
  if (!data) {
    return [];
  }
  
  if (Array.isArray(data)) {
    return data;
  }
  
  // If it's a string that looks like JSON, try to parse it
  if (typeof data === 'string' && (data.startsWith('[') || data.startsWith('{'))) {
    try {
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      console.error("Error parsing result_data:", e);
      return [data]; // Return as single item array if parsing fails
    }
  }
  
  // Return as single item array for any other type
  return [data];
};

// Helper function to map database status to Dataset status type
const mapDatabaseStatus = (status: string): "pending" | "running" | "completed" | "failed" => {
  switch (status) {
    case "ready":
      return "completed";
    case "processing":
      return "running";
    case "creating":
      return "pending";
    case "error":
      return "failed";
    default:
      return "pending"; // Default fallback
  }
};

// Fetch all deleted datasets
export const fetchDeletedDatasets = async (): Promise<Dataset[]> => {
  try {
    const { data, error } = await supabase
      .from("user_datasets")
      .select("*")
      .eq("status", "deleted")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching deleted datasets:", error);
      // Return empty array instead of throwing
      return [];
    }

    // Type casting with proper mapping to match Dataset interface
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      source_id: item.source_id,
      name: item.name,
      extraction_type: item.dataset_type as "predefined" | "dependent" | "custom",
      template_name: item.description || undefined,
      custom_query: item.query_params && typeof item.query_params === 'object' ? 
                   (item.query_params as any).custom_query : undefined,
      status: "completed", // Deleted datasets are considered completed
      progress: 100, // Completed datasets are at 100%
      result_data: ensureArrayData(item.result_data),
      record_count: item.record_count || 0,
      created_at: item.created_at,
      updated_at: item.last_updated,
      is_deleted: true,
      deletion_marked_at: item.deleted_at || undefined,
    }));
  } catch (error) {
    console.error("Error in fetchDeletedDatasets:", error);
    return [];
  }
};

// Delete a dataset (soft delete)
export const deleteDataset = async (datasetId: string): Promise<boolean> => {
  try {
    const updateData = {
      status: "deleted",
      deleted_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from("user_datasets")
      .update(updateData)
      .eq("id", datasetId);

    if (error) {
      console.error("Error deleting dataset:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteDataset:", error);
    return false;
  }
};

// Restore a deleted dataset
export const restoreDataset = async (datasetId: string): Promise<Dataset | null> => {
  try {
    const { data, error } = await supabase
      .from("user_datasets")
      .update({
        status: "ready",
        deleted_at: null
      })
      .eq("id", datasetId)
      .select()
      .single();

    if (error) {
      console.error("Error restoring dataset:", error);
      return null;
    }

    // Map to the Dataset interface
    return {
      id: data.id,
      user_id: data.user_id,
      source_id: data.source_id,
      name: data.name,
      extraction_type: data.dataset_type as "predefined" | "dependent" | "custom",
      template_name: data.description || undefined,
      custom_query: data.query_params && typeof data.query_params === 'object' ? 
                  (data.query_params as any).custom_query : undefined,
      status: "completed", // Restored datasets are considered completed
      progress: 100, // Restored datasets are at 100%
      result_data: ensureArrayData(data.result_data),
      record_count: data.record_count || 0,
      created_at: data.created_at,
      updated_at: data.last_updated,
      is_deleted: false
    };
  } catch (error) {
    console.error("Error in restoreDataset:", error);
    return null;
  }
};

// Permanently delete a dataset
export const permanentlyDeleteDataset = async (datasetId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("user_datasets")
      .delete()
      .eq("id", datasetId);

    if (error) {
      console.error("Error permanently deleting dataset:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in permanentlyDeleteDataset:", error);
    return false;
  }
};
