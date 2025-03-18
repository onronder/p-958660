
import { supabase } from "@/integrations/supabase/client";
import { DevLog } from "./types";
import { devLogger } from "@/utils/DevLogger";

/**
 * Fetch logs with optional filtering
 */
export async function fetchLogs(
  limit: number = 100,
  offset: number = 0,
  filters: Record<string, any> = {}
): Promise<{ logs: DevLog[], count: number, error: string | null }> {
  try {
    // Define the query
    let query = supabase
      .from('dev_logs')
      .select('id, timestamp, log_level, source, message, details, user_id, route, stack_trace, request_data, response_data');
    
    // Add ordering, limits and range
    query = query.order('timestamp', { ascending: false });
    query = query.limit(limit);
    query = query.range(offset, offset + limit - 1);

    // Apply filters dynamically
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Using any to bypass TypeScript's recursive type inference
        query = (query as any).eq(key, value);
      }
    });

    const { data, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    // Get total count separately
    const { count, error: countError } = await supabase
      .from('dev_logs')
      .select('id', { count: 'exact', head: true });

    if (countError) {
      throw countError;
    }

    return {
      logs: data || [],
      count: count || 0,
      error: null
    };
  } catch (err: any) {
    console.error('Error loading logs:', err);
    return {
      logs: [],
      count: 0,
      error: err.message || 'Failed to load logs'
    };
  }
}

/**
 * Clear all logs from the database
 */
export async function clearAllLogs(): Promise<{ success: boolean, error: string | null }> {
  try {
    await devLogger.clearAllLogs();
    return { success: true, error: null };
  } catch (err: any) {
    console.error('Error clearing logs:', err);
    return { success: false, error: err.message || 'Failed to clear logs' };
  }
}
