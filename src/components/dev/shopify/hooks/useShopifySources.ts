
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { devLogger } from '@/utils/logger';

export interface SourceOption {
  id: string;
  name: string;
}

export const useShopifySources = () => {
  const [sources, setSources] = useState<SourceOption[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [isLoadingSources, setIsLoadingSources] = useState(false);

  const loadSources = async () => {
    try {
      setIsLoadingSources(true);
      devLogger.info('test_shopify_api', 'Loading Shopify sources for testing');
      
      const { data, error } = await supabase
        .from('sources')
        .select('id, name')
        .eq('source_type', 'Shopify')
        .eq('is_deleted', false);
        
      if (error) {
        throw error;
      }
      
      setSources(data as SourceOption[]);
      devLogger.debug('test_shopify_api', 'Loaded sources', { count: data.length });
      
      if (data.length > 0 && !selectedSourceId) {
        setSelectedSourceId(data[0].id);
      }
    } catch (error) {
      devLogger.error('test_shopify_api', 'Error loading sources', error);
      toast({
        title: 'Error',
        description: 'Failed to load Shopify sources',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingSources(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  return {
    sources,
    selectedSourceId,
    setSelectedSourceId,
    isLoadingSources,
    loadSources
  };
};
