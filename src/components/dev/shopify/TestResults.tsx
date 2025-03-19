
import React from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DownloadCloud } from "lucide-react";

interface TestResultsProps {
  testOutput: {
    status?: string;
    data?: any;
    error?: any;
    executionTime?: number;
    timestamp?: string;
  } | null;
  onDownload: () => void;
}

const TestResults: React.FC<TestResultsProps> = ({
  testOutput,
  onDownload
}) => {
  if (!testOutput) return null;

  const formatOutput = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return 'Unable to format output';
    }
  };

  return (
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
          onClick={onDownload}
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
  );
};

export default TestResults;
