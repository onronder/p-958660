
import { supabase } from '@/integrations/supabase/client';

export async function getDatasets(userId: string): Promise<any[]> {
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

export async function getDatasetById(id: string): Promise<any | null> {
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

// Add these functions to fix the build errors
export const fetchDatasets = getDatasets;

export async function fetchDeletedDatasets(userId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('user_datasets')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'deleted')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deleted datasets:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching deleted datasets:', error);
    return [];
  }
}

export async function permanentlyDeleteDataset(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_datasets')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error permanently deleting dataset:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error permanently deleting dataset:', error);
    return false;
  }
}
