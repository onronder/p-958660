
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const useDatasetCreation = () => {
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const createDataset = async (
    datasetName: string,
    sourceId: string,
    datasetType: string,
    selectedTemplate: string,
    selectedDependentTemplate?: string,
    customQuery?: string
  ) => {
    setIsCreating(true);
    
    try {
      // For predefined datasets, we'll get the template_key 
      // to execute the predefined function
      if (datasetType === 'predefined') {
        // Get template details to find template_key
        const { data: templateData, error: templateError } = await supabase
          .from('pre_datasettemplate')
          .select('template_key')
          .eq('id', selectedTemplate)
          .single();
          
        if (templateError) {
          throw new Error(`Template not found: ${templateError.message}`);
        }
        
        // Execute the predefined dataset function
        const { data, error } = await supabase.functions.invoke(
          `pre_${templateData.template_key}`,
          {
            body: {
              source_id: sourceId,
            }
          }
        );
        
        if (error) {
          throw new Error(`Error executing dataset: ${error.message}`);
        }
        
        // The function already creates the dataset in user_datasets, 
        // so we don't need to save it here
        
        toast({
          title: 'Dataset Created',
          description: 'Your dataset has been created successfully.',
        });
        
        // Navigate to datasets page
        navigate('/datasets');
        return;
      }
      
      // Handle dependent datasets
      if (datasetType === 'dependent') {
        // This will be implemented in a future step
        throw new Error('Dependent dataset creation is not yet implemented');
      }
      
      // Handle custom datasets
      if (datasetType === 'custom') {
        if (!customQuery) {
          throw new Error('Custom query is required');
        }
        
        // Execute custom query and save to database
        const response = await fetch('/api/datasets/custom-create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: datasetName,
            sourceId,
            query: customQuery,
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create custom dataset');
        }
        
        toast({
          title: 'Dataset Created',
          description: 'Your custom dataset has been created successfully.',
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
    }
  };

  return {
    isCreating,
    createDataset,
  };
};
