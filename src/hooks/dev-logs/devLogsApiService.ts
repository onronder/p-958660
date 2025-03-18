
import { supabase } from "@/integrations/supabase/client";
import { DevLog } from "./types";
import { devLogger } from "@/utils/logger";

/**
 * Fetch logs with optional filtering
 */
export async function fetchLogs(
  limit: number = 100,
  offset: number = 0,
  filters: Record<string, any> = {}
): Promise<{ logs: DevLog[], count: number, error: string | null }> {
  try {
    // Use the new logger method for fetching logs
    return await devLogger.fetchLogs(limit, offset, filters);
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
