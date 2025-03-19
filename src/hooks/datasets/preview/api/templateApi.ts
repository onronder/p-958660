
import { supabase } from "@/integrations/supabase/client";
import { devLogger } from '@/utils/logger';
import { logApiRequest } from './apiBase';

/**
 * Fetch template details from the database
 */
export const fetchTemplateDetails = async (templateId: string) => {
  try {
    logApiRequest('Template details', { templateId });
    
    const response = await supabase
      .from("pre_datasettemplate")
      .select("*")
      .eq("id", templateId)
      .single();
    
    return response;
  } catch (error) {
    devLogger.error('Dataset Preview API', 'Error fetching template details', error);
    throw error;
  }
};
