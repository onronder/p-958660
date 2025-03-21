
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { devLogger } from '@/utils/logger';
import { supabase } from "@/integrations/supabase/client";

export interface SourceOption {
  id: string;
  name: string;
  credentials?: {
    store_name?: string;
    client_id?: string;
    client_secret?: string;
    access_token?: string;
    api_key?: string;
    api_token?: string;
  };
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
        .select('id, name, credentials')
        .eq('source_type', 'Shopify')
        .eq('is_deleted', false);
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const shopifySources: SourceOption[] = data.map(source => {
          // Cast credentials to Record to safely access properties
          const creds = source.credentials as Record<string, any> || {};
          
          return {
            id: source.id,
            name: source.name,
            credentials: {
              store_name: creds.store_name || '',
              client_id: creds.client_id || '',
              client_secret: creds.client_secret || '',
              access_token: creds.access_token || '',
              // Support for legacy credential fields
              api_key: creds.api_key || '',
              api_token: creds.api_token || ''
            }
          };
        });
        
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
