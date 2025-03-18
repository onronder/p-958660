
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { devLogger } from '@/utils/DevLogger';

export const useDatasetCreation = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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

    if (!user?.id) {
      toast({
        title: 'Authentication Error',
        description: 'You must be logged in to create a dataset.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    setProgress(10);

    try {
      // Log the dataset creation attempt
      devLogger.info('Dataset Creation', `Creating dataset: ${name} of type: ${datasetType}`, {
        sourceId,
        datasetType,
        templateId,
        hasPreviewData: !!previewData,
        previewDataCount: previewData?.length || 0
      });
      
      // Create the initial dataset record
      const initialData = {
        name,
        source_id: sourceId,
        dataset_type: datasetType, // Match the column name in the database
        status: 'creating',
        template_id: templateId, // Match the column name in the database
        dependent_template_id: dependentTemplateId,
        custom_query: customQuery,
        user_id: user.id,
        result_data: previewData ? previewData.slice(0, 20) : [], // Store first 20 records for immediate display
        record_count: previewData?.length || 0
      };

      // Insert the dataset into the database
      const { data: createdDataset, error } = await supabase
        .from('user_datasets')
        .insert(initialData)
        .select()
        .single();

      if (error) {
        devLogger.error('Dataset Creation', 'Failed to create dataset', error, {
          datasetName: name,
          sourceId
        });
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
        
        devLogger.info('Dataset Processing', 'Processing full dataset', {
          datasetId: createdDataset.id,
          recordCount: previewData.length
        });
        
        // Wait for data processing (simulated with setTimeout)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Update the dataset with full data
        const { error: updateError } = await supabase
          .from('user_datasets')
          .update({
            status: 'ready',
            result_data: previewData,
            record_count: previewData.length,
            completed_at: new Date().toISOString()
          })
          .eq('id', createdDataset.id);

        if (updateError) {
          devLogger.error('Dataset Processing', 'Failed to update dataset with full data', updateError, {
            datasetId: createdDataset.id
          });
          
          toast({
            title: 'Warning',
            description: 'Dataset created but full data processing had an issue. You may need to refresh.',
            variant: 'destructive',
          });
        } else {
          setProgress(100);
          
          devLogger.info('Dataset Creation', 'Dataset processing completed', {
            datasetId: createdDataset.id,
            recordCount: previewData.length
          });
          
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
            record_count: previewData ? previewData.length : 0,
            completed_at: new Date().toISOString()
          })
          .eq('id', createdDataset.id);

        if (updateError) {
          devLogger.error('Dataset Creation', 'Error updating dataset status', updateError, {
            datasetId: createdDataset.id
          });
        }
        
        setProgress(100);
        
        devLogger.info('Dataset Creation', 'Small dataset created and marked ready', {
          datasetId: createdDataset.id,
          recordCount: previewData?.length || 0
        });
      }

      // Navigate to the datasets page after a short delay
      setTimeout(() => {
        navigate('/datasets');
      }, 2000);
    } catch (error) {
      console.error('Error creating dataset:', error);
      
      devLogger.error('Dataset Creation', 'Dataset creation failed', error);
      
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
