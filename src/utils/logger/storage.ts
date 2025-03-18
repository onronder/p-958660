
import { supabase } from "@/integrations/supabase/client";
import { DevLogEntry, PersistedLog, LogLevel, LogDetails } from './types';

/**
 * Handles log storage operations
 */
export class LogStorage {
  private persistEnabled: boolean = true;
  
  /**
   * Enable or disable log persistence
   */
  setPersistEnabled(enabled: boolean): void {
    this.persistEnabled = enabled;
  }
  
  /**
   * Store a log entry in the database
   */
  async storeLog(entry: DevLogEntry): Promise<void> {
    if (!this.persistEnabled) return;
    
    try {
      const { error } = await supabase.from('dev_logs').insert([entry]);
      if (error) {
        console.error('Failed to store log entry:', error);
      }
    } catch (storeError) {
      console.error('Exception storing log entry:', storeError);
    }
  }
  
  /**
   * Clear all logs from the database
   */
  async clearAllLogs(): Promise<void> {
    try {
      await supabase.from('dev_logs').delete().gt('id', '0');
      console.log('All dev logs cleared');
    } catch (error) {
      console.error('Failed to clear logs:', error);
      throw error;
    }
  }
  
  /**
   * Fetch logs with optional filtering
   */
  async fetchLogs(
    limit: number = 100,
    offset: number = 0,
    filters: Record<string, any> = {}
  ): Promise<{ logs: PersistedLog[], count: number, error: string | null }> {
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

      // Transform the data to ensure correct typing
      const typedLogs: PersistedLog[] = data?.map(item => ({
        id: item.id,
        timestamp: item.timestamp,
        log_level: (item.log_level as LogLevel) || 'info',
        source: item.source,
        message: item.message,
        details: item.details as LogDetails || {},
        user_id: item.user_id,
        route: item.route,
        stack_trace: item.stack_trace,
        request_data: item.request_data,
        response_data: item.response_data
      })) || [];

      return {
        logs: typedLogs,
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
}

// Export a singleton instance
export const logStorage = new LogStorage();
