
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useDatasetCreation = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);

  const createDataset = async (
    name: string,
    sourceId: string,
    datasetType: 'predefined' | 'dependent' | 'custom',
    templateId?: string,
    previewData?: any[],
    dependentTemplateId?: string,
    customQuery?: string
  ) => {
    if (!name || !sourceId) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a name and select a source for the dataset.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    setProgress(10);

    try {
      // Create the initial dataset record
      const initialData = {
        name,
        source_id: sourceId,
        extraction_type: datasetType,
        status: 'creating',
        query_template_id: templateId,
        dependent_template_id: dependentTemplateId,
        custom_query: customQuery,
        preview_data: previewData ? previewData.slice(0, 20) : [], // Include first 20 records for immediate display
      };

      // Insert the dataset into the database
      const { data: createdDataset, error } = await supabase
        .from('user_datasets')
        .insert(initialData)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create dataset: ${error.message}`);
      }

      setProgress(30);

      // Show the initial success toast
      const initialToast = toast({
        title: 'Dataset Created',
        description: 'Initial dataset created. Processing full data...',
      });

      // Process full dataset in the background for large datasets
      if (previewData && previewData.length > 20) {
        // Simulate processing of larger dataset
        setProgress(50);
        
        // Wait for data processing (simulated with setTimeout)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update the dataset with full data
        const { error: updateError } = await supabase
          .from('user_datasets')
          .update({
            status: 'ready',
            preview_data: previewData,
            row_count: previewData.length,
            completed_at: new Date().toISOString()
          })
          .eq('id', createdDataset.id);

        if (updateError) {
          toast({
            title: 'Warning',
            description: 'Dataset created but full data processing had an issue. You may need to refresh.',
            variant: 'destructive',
          });
        } else {
          setProgress(100);
          
          // Update the toast to show completion
          toast({
            title: 'Dataset Ready',
            description: `Processed ${previewData.length} records successfully.`,
            variant: 'default',
          });
        }
      } else {
        // For small datasets, mark as complete immediately
        const { error: updateError } = await supabase
          .from('user_datasets')
          .update({
            status: 'ready',
            row_count: previewData ? previewData.length : 0,
            completed_at: new Date().toISOString()
          })
          .eq('id', createdDataset.id);

        if (updateError) {
          console.error('Error updating dataset status:', updateError);
        }
        
        setProgress(100);
      }

      // Navigate to the datasets page after a short delay
      setTimeout(() => {
        navigate('/datasets');
      }, 2000);
    } catch (error) {
      console.error('Error creating dataset:', error);
      
      toast({
        title: 'Failed to Create Dataset',
        description: error.message || 'There was an error creating the dataset.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createDataset,
    isCreating,
    progress
  };
};
