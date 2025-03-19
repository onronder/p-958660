
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2, Play, RefreshCw, DownloadCloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { devLogger } from '@/utils/logger';

interface SourceOption {
  id: string;
  name: string;
}

const TEST_QUERY_SIMPLE = `{
  shop {
    name
    email
    url
  }
}`;

const TEST_QUERY_PRODUCTS = `{
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

const ShopifyApiTester: React.FC = () => {
  const [sources, setSources] = useState<SourceOption[]>([]);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [query, setQuery] = useState(TEST_QUERY_SIMPLE);
  const [isExecuting, setIsExecuting] = useState(false);
  const [testOutput, setTestOutput] = useState<{
    status?: string;
    data?: any;
    error?: any;
    executionTime?: number;
    timestamp?: string;
  } | null>(null);

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
        status: response.status,
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
    } catch (error) {
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
  
  const setQueryTemplate = (template: string) => {
    setQuery(template);
  };
  
  // Load sources when component mounts
  React.useEffect(() => {
    loadSources();
  }, []);
  
  // Format JSON output with syntax highlighting
  const formatOutput = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return 'Unable to format output';
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center">
            <Beaker className="mr-2 h-5 w-5" />
            Shopify API Tester
          </CardTitle>
          <CardDescription>
            Test GraphQL queries against the Shopify Admin API using your connected sources
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="source">Shopify Source</Label>
                <Select
                  value={selectedSourceId}
                  onValueChange={setSelectedSourceId}
                  disabled={isLoadingSources}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Shopify source" />
                  </SelectTrigger>
                  <SelectContent>
                    {sources.map((source) => (
                      <SelectItem key={source.id} value={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={loadSources}
                disabled={isLoadingSources}
              >
                {isLoadingSources ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="query">GraphQL Query</Label>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setQueryTemplate(TEST_QUERY_SIMPLE)}
                  >
                    Shop Info
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setQueryTemplate(TEST_QUERY_PRODUCTS)}
                  >
                    Products
                  </Button>
                </div>
              </div>
              <Textarea
                id="query"
                className="font-mono h-64"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your GraphQL query here..."
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              onClick={executeDirectQuery}
              disabled={isExecuting || !selectedSourceId}
            >
              {isExecuting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Execute Query
            </Button>
          </div>
          
          {testOutput && (
            <div className="border rounded-md p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-medium">
                    Test Results
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      testOutput.status === 'Success' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {testOutput.status}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Execution time: {testOutput.executionTime}ms | {new Date(testOutput.timestamp || '').toLocaleString()}
                  </p>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadResults}
                >
                  <DownloadCloud className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              
              <Tabs defaultValue="output" className="w-full">
                <TabsList>
                  <TabsTrigger value="output">Response</TabsTrigger>
                  {testOutput.error && <TabsTrigger value="error">Error</TabsTrigger>}
                </TabsList>
                
                <TabsContent value="output" className="mt-2">
                  <pre className="text-xs bg-muted p-4 rounded-md overflow-auto max-h-64">
                    {formatOutput(testOutput.data || {})}
                  </pre>
                </TabsContent>
                
                {testOutput.error && (
                  <TabsContent value="error" className="mt-2">
                    <pre className="text-xs bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-4 rounded-md overflow-auto max-h-64">
                      {formatOutput(testOutput.error)}
                    </pre>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopifyApiTester;
