
import { supabase } from "@/integrations/supabase/client";

export interface PredefinedDatasetTemplate {
  id: string;
  name: string;
  description: string;
  template_key: string;
  query_structure: {
    query: string;
    defaultParams: Record<string, any>;
    dataPath: string;
  };
  source_type: string;
  created_at: string;
  updated_at: string;
}

export interface UserDataset {
  id: string;
  user_id: string;
  source_id: string;
  template_id: string | null;
  name: string;
  description: string | null;
  dataset_type: 'predefined' | 'dependent' | 'custom';
  query_params: Record<string, any> | null;
  result_data: any;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error_message: string | null;
  record_count: number | null;
  last_updated: string;
  created_at: string;
}

// Fetch predefined dataset templates
export const fetchPredefinedTemplates = async (sourceType?: string): Promise<PredefinedDatasetTemplate[]> => {
  try {
    let query = supabase
      .from("pre_datasettemplate")
      .select("*");
    
    if (sourceType) {
      query = query.eq("source_type", sourceType);
    }
    
    const { data, error } = await query.order("name");

    if (error) {
      console.error("Error fetching predefined dataset templates:", error);
      return [];
    }

    return data as PredefinedDatasetTemplate[];
  } catch (error) {
    console.error("Error in fetchPredefinedTemplates:", error);
    return [];
  }
};

// Fetch a specific predefined dataset template by ID
export const fetchPredefinedTemplateById = async (templateId: string): Promise<PredefinedDatasetTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from("pre_datasettemplate")
      .select("*")
      .eq("id", templateId)
      .single();

    if (error) {
      console.error("Error fetching predefined dataset template:", error);
      return null;
    }

    return data as PredefinedDatasetTemplate;
  } catch (error) {
    console.error("Error in fetchPredefinedTemplateById:", error);
    return null;
  }
};

// Fetch user datasets
export const fetchUserDatasets = async (): Promise<UserDataset[]> => {
  try {
    const { data, error } = await supabase
      .from("user_datasets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user datasets:", error);
      return [];
    }

    return data as UserDataset[];
  } catch (error) {
    console.error("Error in fetchUserDatasets:", error);
    return [];
  }
};

// Execute a predefined dataset query
export const executePreDefinedDataset = async (
  templateKey: string,
  sourceId: string,
  params?: Record<string, any>
): Promise<{ data: any; error: any }> => {
  try {
    const { data, error } = await supabase.functions.invoke(
      `pre_${templateKey}`,
      {
        body: {
          source_id: sourceId,
          ...params
        }
      }
    );

    if (error) {
      console.error(`Error executing predefined dataset ${templateKey}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error(`Error in executePreDefinedDataset for ${templateKey}:`, error);
    return { data: null, error };
  }
};

// Delete a user dataset
export const deleteUserDataset = async (datasetId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("user_datasets")
      .delete()
      .eq("id", datasetId);

    if (error) {
      console.error("Error deleting user dataset:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in deleteUserDataset:", error);
    return false;
  }
};
