
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useDatasetCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  const createDataset = async (
    datasetName: string,
    sourceId: string,
    datasetType: string,
    selectedTemplate: string,
    previewData: any[],
    selectedDependentTemplate?: string,
    customQuery?: string
  ) => {
    setIsCreating(true);
    
    try {
      // Show initial notification
      const toastId = toast({
        title: 'Creating Dataset',
        description: 'Starting dataset creation process...',
      });
      
      setProgress(10);
      
      // For predefined datasets, get the template details
      if (datasetType === 'predefined') {
        // Get template details to find template_key
        const { data: templateData, error: templateError } = await supabase
          .from('pre_datasettemplate')
          .select('template_key, name')
          .eq('id', selectedTemplate)
          .single();
          
        if (templateError) {
          throw new Error(`Template not found: ${templateError.message}`);
        }
        
        setProgress(30);
        
        // Update toast with more info
        toast({
          id: toastId,
          title: 'Processing Dataset',
          description: `Preparing data for "${templateData.name}"...`,
        });
        
        // Save initial dataset entry with preview data
        const initialData = previewData.slice(0, Math.min(previewData.length, 20)); // Take up to 20 records for initial preview
        const recordCount = previewData.length;
        
        const datasetEntry = {
          name: datasetName,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          source_id: sourceId,
          dataset_type: datasetType,
          template_id: selectedTemplate,
          query_params: { template_key: templateData.template_key },
          result_data: initialData,
          record_count: recordCount,
          status: recordCount > 20 ? 'processing' : 'completed'
        };
        
        const { data: dataset, error: saveError } = await supabase
          .from('user_datasets')
          .insert(datasetEntry)
          .select()
          .single();
        
        if (saveError) {
          throw new Error(`Error saving dataset: ${saveError.message}`);
        }
        
        setProgress(70);
        
        // If we have a large dataset, initiate background processing
        if (recordCount > 20) {
          // Update toast with progress info
          toast({
            id: toastId,
            title: 'Dataset Creation in Progress',
            description: `Initial dataset saved. Full data (${recordCount} records) will continue processing in the background.`,
          });
          
          // Call background processing function
          const { error: processingError } = await supabase.functions.invoke(
            `pre_${templateData.template_key}`,
            {
              body: {
                source_id: sourceId,
                dataset_id: dataset.id,
                save_full_dataset: true
              }
            }
          );
          
          if (processingError) {
            console.warn('Background processing may have issues:', processingError);
            // We still continue - the initial dataset is saved
          }
        }
        
        setProgress(100);
        
        // Final success notification
        toast({
          title: 'Dataset Created',
          description: `${datasetName} has been created successfully${recordCount > 20 ? '. Full data processing continues in the background.' : '.'}`
        });
        
        // Navigate to datasets page
        navigate('/datasets');
        return;
      }
      
      // Handle dependent datasets
      if (datasetType === 'dependent') {
        toast({
          title: 'Not Implemented',
          description: 'Dependent dataset creation is not yet implemented',
          variant: 'destructive'
        });
        throw new Error('Dependent dataset creation is not yet implemented');
      }
      
      // Handle custom datasets
      if (datasetType === 'custom') {
        if (!customQuery) {
          throw new Error('Custom query is required');
        }
        
        setProgress(30);
        
        // Update toast
        toast({
          id: toastId,
          title: 'Processing Custom Dataset',
          description: 'Executing custom query...',
        });
        
        // Save initial dataset with preview data
        const initialData = previewData.slice(0, Math.min(previewData.length, 20));
        const recordCount = previewData.length;
        
        const datasetEntry = {
          name: datasetName,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          source_id: sourceId,
          dataset_type: datasetType,
          query_params: { query: customQuery },
          result_data: initialData,
          record_count: recordCount,
          status: recordCount > 20 ? 'processing' : 'completed'
        };
        
        const { data: dataset, error: saveError } = await supabase
          .from('user_datasets')
          .insert(datasetEntry)
          .select()
          .single();
        
        if (saveError) {
          throw new Error(`Error saving dataset: ${saveError.message}`);
        }
        
        setProgress(70);
        
        // If we have a large dataset, initiate background processing
        if (recordCount > 20) {
          // Update toast
          toast({
            id: toastId,
            title: 'Dataset Creation in Progress',
            description: `Initial preview saved. Full data (${recordCount} records) will continue processing in the background.`,
          });
          
          // Call background processing function
          const { error: processingError } = await fetch('/api/datasets/custom-create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dataset_id: dataset.id,
              name: datasetName,
              sourceId,
              query: customQuery,
            }),
          }).then(res => res.json());
          
          if (processingError) {
            console.warn('Background processing may have issues:', processingError);
          }
        }
        
        setProgress(100);
        
        // Final success notification
        toast({
          title: 'Dataset Created',
          description: `${datasetName} has been created successfully${recordCount > 20 ? '. Full data processing continues in the background.' : '.'}`
        });
        
        // Navigate to datasets page
        navigate('/datasets');
        return;
      }
      
    } catch (error) {
      console.error('Error creating dataset:', error);
      toast({
        title: 'Dataset Creation Failed',
        description: error.message || 'There was an error creating the dataset.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
      setProgress(0);
    }
  };

  return {
    isCreating,
    progress,
    createDataset,
  };
};
