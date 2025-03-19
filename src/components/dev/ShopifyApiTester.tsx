
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Beaker } from "lucide-react";
import SourceSelector from './shopify/SourceSelector';
import QueryEditor from './shopify/QueryEditor';
import TestResults from './shopify/TestResults';
import { useShopifyTester, TEST_QUERY_SIMPLE, TEST_QUERY_PRODUCTS } from './shopify/useShopifyTester';

const ShopifyApiTester: React.FC = () => {
  const {
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
  } = useShopifyTester();

  const queryTemplates = [
    { name: 'Shop Info', query: TEST_QUERY_SIMPLE },
    { name: 'Products', query: TEST_QUERY_PRODUCTS }
  ];

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
            <SourceSelector
              sources={sources}
              selectedSourceId={selectedSourceId}
              setSelectedSourceId={setSelectedSourceId}
              isLoadingSources={isLoadingSources}
              onRefresh={loadSources}
            />
            
            <QueryEditor
              query={query}
              setQuery={setQuery}
              queryTemplates={queryTemplates}
            />
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
            <TestResults 
              testOutput={testOutput} 
              onDownload={downloadResults} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShopifyApiTester;
