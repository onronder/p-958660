
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export const useDatasetCreation = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);

  // Handle submission of the dataset creation
  const createDataset = async (
    datasetName: string,
    selectedSourceId: string,
    datasetType: 'predefined' | 'dependent' | 'custom',
    selectedTemplate: string,
    selectedDependentTemplate: string,
    customQuery: string
  ) => {
    try {
      setIsCreating(true);
      
      // Validate required fields
      if (!datasetName.trim()) {
        toast({
          title: "Error",
          description: "Dataset name is required",
          variant: "destructive",
        });
        return false;
      }
      
      if (!selectedSourceId) {
        toast({
          title: "Error",
          description: "Please select a data source",
          variant: "destructive",
        });
        return false;
      }
      
      // Specific validation based on dataset type
      if (datasetType === 'predefined' && !selectedTemplate) {
        toast({
          title: "Error",
          description: "Please select a template",
          variant: "destructive",
        });
        return false;
      }
      
      if (datasetType === 'dependent' && !selectedDependentTemplate) {
        toast({
          title: "Error",
          description: "Please select a dependent template",
          variant: "destructive",
        });
        return false;
      }
      
      if (datasetType === 'custom' && !customQuery.trim()) {
        toast({
          title: "Error",
          description: "Please provide a custom GraphQL query",
          variant: "destructive",
        });
        return false;
      }
      
      // Get the user id from the session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        throw new Error("No authenticated session");
      }
      
      // Build dataset object with the required types
      const dataset: {
        name: string;
        source_id: string;
        user_id: string;
        extraction_type: "predefined" | "dependent" | "custom";
        status: string;
        progress: number;
        is_deleted: boolean;
        template_name?: string;
        custom_query?: string;
      } = {
        name: datasetName,
        source_id: selectedSourceId,
        user_id: session.user.id,
        extraction_type: datasetType,
        status: "pending",
        progress: 0,
        is_deleted: false
      };
      
      // Add specific fields based on dataset type
      if (datasetType === 'predefined') {
        dataset.template_name = selectedTemplate;
      } else if (datasetType === 'dependent') {
        dataset.template_name = selectedDependentTemplate;
      } else if (datasetType === 'custom') {
        dataset.custom_query = customQuery;
      }
      
      // Insert dataset
      const { data, error } = await supabase
        .from("extractions")
        .insert(dataset)
        .select()
        .single();
      
      if (error) {
        throw new Error(`Failed to create dataset: ${error.message}`);
      }
      
      // Clear session storage
      sessionStorage.removeItem('createDatasetState');
      
      // Show success message and redirect
      toast({
        title: "Dataset Created",
        description: "Your dataset has been created successfully",
      });
      
      navigate("/datasets");
      return true;
      
    } catch (error: any) {
      console.error("Error creating dataset:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create dataset",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    isCreating,
    createDataset
  };
};
