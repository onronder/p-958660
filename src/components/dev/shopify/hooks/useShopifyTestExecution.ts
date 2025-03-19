
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { devLogger } from '@/utils/logger';
import { supabase } from "@/integrations/supabase/client";

export interface TestOutput {
  status?: string;
  data?: any;
  error?: any;
  executionTime?: number;
  timestamp?: string;
}

export const useShopifyTestExecution = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [testOutput, setTestOutput] = useState<TestOutput | null>(null);

  const executeDirectQuery = async (selectedSourceId: string, query: string) => {
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
      devLogger.info('shopify_api', 'Executing test query', {
        sourceId: selectedSourceId,
        queryLength: query.length
      });
      
      // Make the real API call to the test-shopify-graphql Edge Function
      const response = await supabase.functions.invoke('test-shopify-graphql', {
        body: {
          source_id: selectedSourceId,
          query: query
        }
      });
      
      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(2);
      
      if (response.error) {
        throw new Error(response.error.message || 'Error executing query');
      }
      
      // Log response details
      devLogger.debug('shopify_api', 'Test query response', {
        hasData: !!response.data,
        executionTime
      });
      
      setTestOutput({
        status: 'Success',
        data: response.data,
        executionTime: parseFloat(executionTime),
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: 'Query Executed',
        description: `Query completed in ${executionTime}ms`,
      });
    } catch (error: any) {
      devLogger.error('shopify_api', 'Error executing test query', error);
      
      // Format the error for display
      let errorDetails;
      
      if (typeof error?.message === 'string') {
        errorDetails = { message: error.message };
      } else if (error?.error) {
        errorDetails = error.error;
      } else {
        errorDetails = { message: "Unknown error occurred" };
      }
      
      setTestOutput({
        status: 'Error',
        error: errorDetails,
        executionTime: 0,
        timestamp: new Date().toISOString()
      });
      
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

  return {
    isExecuting,
    testOutput,
    executeDirectQuery,
    downloadResults
  };
};
