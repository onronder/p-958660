
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface PreviewContentProps {
  previewData: any[];
  previewSample?: string | null;
}

const PreviewContent: React.FC<PreviewContentProps> = ({ previewData, previewSample }) => {
  return (
    <div className="space-y-4">
      {previewSample && (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-semibold">Data Sample (First {Math.min(previewData.length, 3)} records)</h4>
              <span className="text-xs text-muted-foreground">
                Showing {Math.min(previewData.length, 3)} of {previewData.length} records
              </span>
            </div>
            
            <pre className="text-xs p-4 bg-slate-50 rounded-md overflow-auto mt-2 max-h-72 border">
              {previewSample}
            </pre>
          </CardContent>
        </Card>
      )}
      
      <div className="bg-muted/20 p-4 rounded-md border">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-semibold">Full Preview Data</h4>
          <div className="text-xs text-muted-foreground">
            Total records: <span className="font-medium">{previewData.length}</span>
          </div>
        </div>
        
        <div className="overflow-auto max-h-96 border rounded-md">
          <pre className="text-xs p-4 bg-white">
            {JSON.stringify(previewData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PreviewContent;
