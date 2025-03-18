
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { devLogger } from '@/utils/DevLogger';

export interface DevLog {
  id: string;
  timestamp: string;
  log_level: string;
  source: string;
  message: string;
  details?: any;
  user_id?: string;
  route?: string;
  stack_trace?: string;
  request_data?: any;
  response_data?: any;
}

export function useDevLogs() {
  const [logs, setLogs] = useState<DevLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logCount, setLogCount] = useState(0);
  const { user } = useAuth();

  // Function to load logs
  const loadLogs = async (limit: number = 100, offset: number = 0, filters: Record<string, any> = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('dev_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit)
        .range(offset, offset + limit - 1);

      // Apply filters - completely rewritten to avoid type recursion
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null && value !== '') {
          // Don't chain, create a new query reference each time
          query = supabase
            .from('dev_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(limit)
            .range(offset, offset + limit - 1)
            .eq(key, value);
        }
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setLogs(data || []);

      // Get total count
      const { count, error: countError } = await supabase
        .from('dev_logs')
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        setLogCount(count || 0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load logs');
      console.error('Error loading logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to clear logs
  const clearLogs = async () => {
    try {
      setIsLoading(true);
      await devLogger.clearAllLogs();
      await loadLogs();
    } catch (err: any) {
      setError(err.message || 'Failed to clear logs');
      console.error('Error clearing logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Enable/disable logging
  const toggleLogging = (enabled: boolean) => {
    devLogger.setEnabled(enabled);
  };

  // Initial load
  useEffect(() => {
    if (user) {
      loadLogs();
    }
  }, [user]);

  return {
    logs,
    isLoading,
    error,
    logCount,
    loadLogs,
    clearLogs,
    toggleLogging
  };
}
