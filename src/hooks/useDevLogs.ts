
import { useState, useEffect, useCallback } from 'react';
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
  const loadLogs = useCallback(async (
    limit: number = 100,
    offset: number = 0,
    filters: Record<string, any> = {}
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Define the expected return type explicitly
      let query = supabase
        .from('dev_logs')
        .select('id, timestamp, log_level, source, message, details, user_id, route, stack_trace, request_data, response_data');
      
      // Add ordering, limits and range separately to avoid type recursion
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

      setLogs(data || []);

      // Get total count explicitly
      const { count, error: countError } = await supabase
        .from('dev_logs')
        .select('id', { count: 'exact', head: true });

      if (!countError) {
        setLogCount(count || 0);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load logs');
      console.error('Error loading logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to clear logs
  const clearLogs = useCallback(async () => {
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
  }, [loadLogs]);

  // Enable/disable logging
  const toggleLogging = useCallback((enabled: boolean) => {
    devLogger.setEnabled(enabled);
  }, []);

  // Initial load
  useEffect(() => {
    if (user) {
      loadLogs();
    }
  }, [user, loadLogs]);

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
