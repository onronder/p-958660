
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { devLogger } from '@/utils/logger';
import { supabase } from "@/integrations/supabase/client";

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
      devLogger.info('shopify_api', 'Loading Shopify sources');
      
      // Fetch sources from the database
      const { data, error } = await supabase
        .from('sources')
        .select('id, name')
        .eq('source_type', 'Shopify')
        .eq('is_deleted', false);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const shopifySources = data.map(source => ({
          id: source.id,
          name: source.name
        }));
        
        setSources(shopifySources);
        devLogger.debug('shopify_api', 'Loaded sources', { count: shopifySources.length });
        
        if (shopifySources.length > 0 && !selectedSourceId) {
          setSelectedSourceId(shopifySources[0].id);
        }
      } else {
        setSources([]);
        devLogger.debug('shopify_api', 'No Shopify sources found');
      }
    } catch (error) {
      devLogger.error('shopify_api', 'Error loading sources', error);
      toast({
        title: 'Error',
        description: 'Failed to load Shopify sources. Please try again.',
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
