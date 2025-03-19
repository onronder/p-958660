
import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { devLogger } from '@/utils/logger';

export interface TestOutput {
  status?: string;
  data?: any;
  error?: any;
  executionTime?: number;
  timestamp?: string;
}

// Sample mock response data to display in demo mode
const MOCK_RESPONSES = {
  shopInfo: {
    shop: {
      name: "Demo Shop",
      email: "demo@example.com",
      url: "https://demo-shop.myshopify.com"
    }
  },
  products: {
    products: {
      edges: [
        {
          node: {
            id: "gid://shopify/Product/1234567890",
            title: "Sample Product 1",
            description: "This is a sample product description",
            handle: "sample-product-1",
            createdAt: "2023-01-15T09:00:00Z",
            updatedAt: "2023-02-20T14:30:00Z"
          }
        },
        {
          node: {
            id: "gid://shopify/Product/1234567891",
            title: "Sample Product 2",
            description: "Another sample product description",
            handle: "sample-product-2",
            createdAt: "2023-01-16T10:00:00Z",
            updatedAt: "2023-02-21T15:30:00Z"
          }
        }
      ]
    }
  },
  orders: {
    orders: {
      edges: [
        {
          node: {
            id: "gid://shopify/Order/1000001",
            name: "#1001",
            totalPrice: "99.99",
            createdAt: "2023-03-01T12:00:00Z",
            customer: {
              firstName: "John",
              lastName: "Doe",
              email: "john.doe@example.com"
            }
          }
        }
      ]
    }
  },
  customers: {
    customers: {
      edges: [
        {
          node: {
            id: "gid://shopify/Customer/100001",
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@example.com",
            ordersCount: 5,
            totalSpent: "349.95"
          }
        }
      ]
    }
  }
};

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
      devLogger.info('test_shopify_api', 'Executing test query (DEMO MODE)', {
        sourceId: selectedSourceId,
        queryLength: query.length
      });
      
      // Instead of making an actual API call, create a mock response based on the query
      let mockResponse;
      if (query.includes('shop')) {
        mockResponse = MOCK_RESPONSES.shopInfo;
      } else if (query.includes('products')) {
        mockResponse = MOCK_RESPONSES.products;
      } else if (query.includes('orders')) {
        mockResponse = MOCK_RESPONSES.orders;
      } else if (query.includes('customers')) {
        mockResponse = MOCK_RESPONSES.customers;
      } else {
        mockResponse = { message: "No sample data available for this query type" };
      }
      
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const endTime = performance.now();
      const executionTime = (endTime - startTime).toFixed(2);
      
      devLogger.debug('test_shopify_api', 'Test query response (DEMO MODE)', {
        hasData: !!mockResponse
      });
      
      setTestOutput({
        status: 'Success',
        data: mockResponse,
        executionTime: parseFloat(executionTime),
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: 'Query Executed (Demo Mode)',
        description: `Demo query completed in ${executionTime}ms`,
      });
    } catch (error: any) {
      devLogger.error('test_shopify_api', 'Error executing test query', error);
      setTestOutput({
        status: 'Error',
        error: { message: "An error occurred in demo mode", details: error?.message || "Unknown error" },
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
