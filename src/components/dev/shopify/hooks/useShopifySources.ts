
import { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { devLogger } from '@/utils/logger';

export interface SourceOption {
  id: string;
  name: string;
}

// Mock data for sources
const MOCK_SOURCES: SourceOption[] = [
  { id: "demo-source-1", name: "Demo Store 1" },
  { id: "demo-source-2", name: "Demo Store 2" },
  { id: "demo-source-3", name: "Demo Store 3" }
];

export const useShopifySources = () => {
  const [sources, setSources] = useState<SourceOption[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [isLoadingSources, setIsLoadingSources] = useState(false);

  const loadSources = async () => {
    try {
      setIsLoadingSources(true);
      devLogger.info('test_shopify_api', 'Loading Shopify sources for testing (DEMO MODE)');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Set mock sources
      setSources(MOCK_SOURCES);
      devLogger.debug('test_shopify_api', 'Loaded mock sources', { count: MOCK_SOURCES.length });
      
      if (MOCK_SOURCES.length > 0 && !selectedSourceId) {
        setSelectedSourceId(MOCK_SOURCES[0].id);
      }
    } catch (error) {
      devLogger.error('test_shopify_api', 'Error loading sources', error);
      toast({
        title: 'Error',
        description: 'Failed to load Shopify sources (Demo Mode)',
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
