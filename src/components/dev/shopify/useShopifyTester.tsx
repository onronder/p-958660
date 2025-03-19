
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { devLogger } from '@/utils/logger';

export const TEST_QUERY_SIMPLE = `{
  shop {
    name
    email
    url
  }
}`;

export const TEST_QUERY_PRODUCTS = `{
  products(first: 5) {
    edges {
      node {
        id
        title
        description
        handle
        createdAt
        updatedAt
      }
    }
  }
}`;

interface SourceOption {
  id: string;
  name: string;
}

interface TestOutput {
  status?: string;
  data?: any;
  error?: any;
  executionTime?: number;
  timestamp?: string;
}

export const useShopifyTester = () => {
  const [sources, setSources] = useState<SourceOption[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [query, setQuery] = useState(TEST_QUERY_SIMPLE);
  const [isExecuting, setIsExecuting] = useState(false);
  const [testOutput, setTestOutput] = useState<TestOutput | null>(null);

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

  const executeDirectQuery = async () => {
    if (!selectedSourceId) {
      toast({
        title: 'No Source Selected',
        description: 'Please select a Shopify source to test',
        variant: 'destructive',
      });
      return;
    }

    if (!query) {
      toast({
        title: 'Empty Query',
        description: 'Please enter a GraphQL query to test',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsExecuting(true);
      setTestOutput(null);
      
      const startTime = performance.now();
      
      // Log the test execution
      devLogger.info('test_shopify_api', 'Executing test query', {
        sourceId: selectedSourceId,
        queryLength: query.length
      });
      
      // Call our Supabase Edge Function to test the query
      const response = await supabase.functions.invoke("test-shopify-graphql", {
        body: {
          source_id: selectedSourceId,
          query: query
        }
      });
      
      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(2);
      
      // Log the response
      devLogger.debug('test_shopify_api', 'Test query response', {
        status: response.status ?? 'unknown',
        hasData: !!response.data,
        hasError: !!response.error
      });
      
      setTestOutput({
        status: response.error ? 'Error' : 'Success',
        data: response.data?.data,
        error: response.error || response.data?.error,
        executionTime: parseFloat(executionTime),
        timestamp: new Date().toISOString()
      });
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (response.data?.error) {
        throw new Error(response.data.error);
      }
      
      toast({
        title: 'Query Executed',
        description: `Query completed in ${executionTime}ms`,
      });
    } catch (error: any) {
      devLogger.error('test_shopify_api', 'Error executing test query', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to execute query',
        variant: 'destructive',
      });
    } finally {
      setIsExecuting(false);
    }
  };
  
  const downloadResults = () => {
    if (!testOutput) return;
    
    try {
      const dataStr = JSON.stringify(testOutput, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportName = `shopify-test-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportName);
      linkElement.click();
      
      toast({
        title: 'Results Downloaded',
        description: `Saved as ${exportName}`,
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download results',
        variant: 'destructive',
      });
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
    query,
    setQuery,
    isExecuting,
    testOutput,
    loadSources,
    executeDirectQuery,
    downloadResults
  };
};
