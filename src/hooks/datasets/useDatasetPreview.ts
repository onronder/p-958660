
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { getSupabaseUrl } from '@/hooks/destinations/api/apiUtils';

export const useDatasetPreview = () => {
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [connectionTestResult, setConnectionTestResult] = useState<{success: boolean; message: string} | undefined>(undefined);
  
  // Generate preview data based on selected options
  const generatePreview = async (
    datasetType: 'predefined' | 'dependent' | 'custom',
    selectedSourceId: string,
    selectedTemplate: string,
    selectedDependentTemplate: string,
    customQuery: string
  ) => {
    setIsPreviewLoading(true);
    setPreviewError(null);
    setPreviewData([]);
    
    try {
      // Get session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No authenticated session");
      }
      
      let endpoint = '';
      let payload = {};
      
      // Determine endpoint and payload based on dataset type
      if (datasetType === 'predefined') {
        endpoint = '/functions/v1/shopify-extract';
        payload = {
          source_id: selectedSourceId,
          template_name: selectedTemplate,
          preview_only: true,
          limit: 5
        };
      } else if (datasetType === 'dependent') {
        endpoint = '/functions/v1/shopify-dependent';
        payload = {
          source_id: selectedSourceId,
          template_name: selectedDependentTemplate,
          preview_only: true,
          limit: 5
        };
      } else if (datasetType === 'custom') {
        endpoint = '/functions/v1/shopify-extract';
        payload = {
          source_id: selectedSourceId,
          custom_query: customQuery,
          preview_only: true,
          limit: 5
        };
      }
      
      // Make request to the appropriate endpoint
      const supabaseUrl = getSupabaseUrl();
      const response = await fetch(`${supabaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate preview");
      }
      
      const data = await response.json();
      
      if (data.results) {
        setPreviewData(data.results);
        if (data.connection_result) {
          setConnectionTestResult({
            success: data.connection_result.success,
            message: data.connection_result.message
          });
        }
      } else {
        toast({
          title: "Warning",
          description: "Preview generated but returned no results",
          variant: "default",
        });
        setPreviewData([]);
      }
    } catch (error: any) {
      console.error("Error generating preview:", error);
      setPreviewError(error.message || "Failed to generate preview");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  return {
    isPreviewLoading,
    previewData,
    previewError,
    connectionTestResult,
    setConnectionTestResult,
    generatePreview
  };
};
