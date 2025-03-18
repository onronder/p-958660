
import { supabase } from "@/integrations/supabase/client";
import { Dataset } from "@/types/dataset";

// Fetch all active datasets
export const fetchDatasets = async (): Promise<Dataset[]> => {
  const { data, error } = await supabase
    .from("extractions")
    .select("*")
    .eq("is_deleted", false)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching datasets:", error);
    throw new Error(`Failed to fetch datasets: ${error.message}`);
  }

  return data || [];
};

// Fetch all deleted datasets
export const fetchDeletedDatasets = async (): Promise<Dataset[]> => {
  const { data, error } = await supabase
    .from("extractions")
    .select("*")
    .eq("is_deleted", true)
    .order("deletion_marked_at", { ascending: false });

  if (error) {
    console.error("Error fetching deleted datasets:", error);
    throw new Error(`Failed to fetch deleted datasets: ${error.message}`);
  }

  return data || [];
};

// Delete a dataset (soft delete)
export const deleteDataset = async (datasetId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("extractions")
    .update({
      is_deleted: true,
      deletion_marked_at: new Date().toISOString(),
      status: "paused"
    })
    .eq("id", datasetId);

  if (error) {
    console.error("Error deleting dataset:", error);
    throw new Error(`Failed to delete dataset: ${error.message}`);
  }

  return true;
};

// Restore a deleted dataset
export const restoreDataset = async (datasetId: string): Promise<Dataset | null> => {
  const { data, error } = await supabase
    .from("extractions")
    .update({
      is_deleted: false,
      deletion_marked_at: null
    })
    .eq("id", datasetId)
    .select()
    .single();

  if (error) {
    console.error("Error restoring dataset:", error);
    throw new Error(`Failed to restore dataset: ${error.message}`);
  }

  return data;
};

// Permanently delete a dataset
export const permanentlyDeleteDataset = async (datasetId: string): Promise<boolean> => {
  const { error } = await supabase
    .from("extractions")
    .delete()
    .eq("id", datasetId);

  if (error) {
    console.error("Error permanently deleting dataset:", error);
    throw new Error(`Failed to permanently delete dataset: ${error.message}`);
  }

  return true;
};
