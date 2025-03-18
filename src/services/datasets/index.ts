import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/supabase';

export async function getDatasets(userId: string): Promise<Database['public']['Tables']['user_datasets']['Row'][]> {
  try {
    const { data, error } = await supabase
      .from('user_datasets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching datasets:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return [];
  }
}

export async function deleteDataset(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_datasets')
      .update({
        status: 'deleted'
      })
      .eq('id', id);

    if (error) {
      console.error('Error deleting dataset:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting dataset:', error);
    return false;
  }
}

export async function restoreDataset(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_datasets')
      .update({
        status: 'active'
      })
      .eq('id', id);

    if (error) {
      console.error('Error restoring dataset:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error restoring dataset:', error);
    return false;
  }
}

export async function getDatasetById(id: string): Promise<Database['public']['Tables']['user_datasets']['Row'] | null> {
  try {
    const { data, error } = await supabase
      .from('user_datasets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching dataset by ID:', error);
      return null;
    }

    return data || null;
  } catch (error) {
    console.error('Error fetching dataset by ID:', error);
    return null;
  }
}
