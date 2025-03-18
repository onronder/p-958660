
import { supabase } from "@/integrations/supabase/client";
import { Dataset } from "@/types/dataset";

// Fetch all active datasets
export const fetchDatasets = async (): Promise<Dataset[]> => {
  try {
    const { data, error } = await supabase
      .from("extractions")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching datasets:", error);
      // Return empty array instead of throwing - this handles the table not existing yet
      return [];
    }

    // Type assertion with type checking
    return (data || []) as Dataset[];
  } catch (error) {
    console.error("Error in fetchDatasets:", error);
    return [];
  }
};

// Fetch all deleted datasets
export const fetchDeletedDatasets = async (): Promise<Dataset[]> => {
  try {
    const { data, error } = await supabase
      .from("extractions")
      .select("*")
      .eq("is_deleted", true)
      .order("deletion_marked_at", { ascending: false });

    if (error) {
      console.error("Error fetching deleted datasets:", error);
      // Return empty array instead of throwing
      return [];
    }

    // Type assertion with type checking
    return (data || []) as Dataset[];
  } catch (error) {
    console.error("Error in fetchDeletedDatasets:", error);
    return [];
  }
};

// Delete a dataset (soft delete)
export const deleteDataset = async (datasetId: string): Promise<boolean> => {
  try {
    const updateData = {
      is_deleted: true,
      deletion_marked_at: new Date().toISOString(),
      status: "pending"
    };

    const { error } = await supabase
      .from("extractions")
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
      return null;
    }

    return data as Dataset;
  } catch (error) {
    console.error("Error in restoreDataset:", error);
    return null;
  }
};

// Permanently delete a dataset
export const permanentlyDeleteDataset = async (datasetId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("extractions")
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
