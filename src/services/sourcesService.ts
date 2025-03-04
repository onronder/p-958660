
import { supabase } from "@/integrations/supabase/client";
import { Source, SourceStatus } from "@/types/source";

export const fetchUserSources = async (userId: string) => {
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    throw error;
  }
  
  return data?.map(source => {
    const status = validateSourceStatus(source.status);
    return {
      ...source,
      status
    } as Source;
  }) || [];
};

export const deleteSource = async (sourceId: string) => {
  const { error } = await supabase
    .from('sources')
    .delete()
    .eq('id', sourceId);
    
  if (error) {
    throw error;
  }
};

export const validateSourceStatus = (status: string): SourceStatus => {
  const validStatuses: SourceStatus[] = ["Active", "Inactive", "Pending", "Failed"];
  return validStatuses.includes(status as SourceStatus) 
    ? (status as SourceStatus) 
    : "Inactive"; // Default fallback
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  }).format(date);
};
