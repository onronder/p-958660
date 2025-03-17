import { useState, useEffect } from "react";
import { Source } from "@/types/source";

/**
 * Hook for managing dataset creation state
 */
export const useDatasetState = () => {
  // Use sessionStorage to persist state between page navigations
  const getStoredState = <T>(key: string, defaultValue: T): T => {
    try {
      // First check the backup value directly
      const backupKey = `dataset_${key}_backup`;
      const backupValue = sessionStorage.getItem(backupKey);
      
      if (backupValue) {
        // If we have a backup value, use it and also save it to the regular key
        const parsedValue = JSON.parse(backupValue);
        sessionStorage.setItem(`dataset_${key}`, backupValue);
        return parsedValue;
      }
      
      // Otherwise use the regular stored value
      const stored = sessionStorage.getItem(`dataset_${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Error retrieving stored state for ${key}:`, error);
      return defaultValue;
    }
  };

  const setStoredState = <T>(key: string, value: T) => {
    try {
      const valueStr = JSON.stringify(value);
      sessionStorage.setItem(`dataset_${key}`, valueStr);
      // Also save as backup
      sessionStorage.setItem(`dataset_${key}_backup`, valueStr);
      console.log(`Stored ${key} in session storage:`, value);
    } catch (error) {
      console.error(`Error storing state for ${key}:`, error);
    }
    return value;
  };

  const [sourceId, setSourceIdState] = useState(() => getStoredState('sourceId', ''));
  const [sourceName, setSourceNameState] = useState(() => getStoredState('sourceName', ''));
  const [datasetType, setDatasetTypeState] = useState<"predefined" | "dependent" | "custom">(() => 
    getStoredState('datasetType', 'predefined') as "predefined" | "dependent" | "custom"
  );
  const [templateName, setTemplateNameState] = useState(() => getStoredState('templateName', ''));
  const [customQuery, setCustomQueryState] = useState(() => getStoredState('customQuery', ''));
  const [name, setNameState] = useState(() => getStoredState('name', ''));
  const [previewData, setPreviewDataState] = useState<any[]>(() => getStoredState('previewData', []));
  
  // Sync state with session storage on component mount
  useEffect(() => {
    console.log("useDatasetState: Initial state loaded", {
      sourceId,
      sourceName,
      datasetType,
      templateName,
      backupSourceId: sessionStorage.getItem('dataset_sourceId_backup'),
      backupSourceName: sessionStorage.getItem('dataset_sourceName_backup')
    });
  }, []);
  
  // Wrapper setters that also update sessionStorage
  const setSourceId = (id: string) => {
    console.log("Setting sourceId in storage:", id);
    setStoredState('sourceId', id);
    setSourceIdState(id);
  };
  
  const setSourceName = (name: string) => {
    setStoredState('sourceName', name);
    setSourceNameState(name);
  };
  
  const setDatasetType = (type: "predefined" | "dependent" | "custom") => {
    setStoredState('datasetType', type);
    setDatasetTypeState(type);
  };
  
  const setTemplateName = (name: string) => {
    setStoredState('templateName', name);
    setTemplateNameState(name);
  };
  
  const setCustomQuery = (query: string) => {
    setStoredState('customQuery', query);
    setCustomQueryState(query);
  };
  
  const setName = (name: string) => {
    setStoredState('name', name);
    setNameState(name);
  };
  
  const setPreviewData = (data: any[]) => {
    setStoredState('previewData', data);
    setPreviewDataState(data);
  };
  
  const resetState = () => {
    // Clear all stored dataset state
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('dataset_')) {
        sessionStorage.removeItem(key);
      }
    });
    
    // Reset all state values
    setSourceIdState('');
    setSourceNameState('');
    setDatasetTypeState('predefined');
    setTemplateNameState('');
    setCustomQueryState('');
    setNameState('');
    setPreviewDataState([]);
  };
  
  return {
    // Source info
    sourceId,
    sourceName,
    setSourceId,
    setSourceName,
    
    // Dataset type
    datasetType,
    setDatasetType,
    
    // Template/query
    templateName,
    setTemplateName,
    customQuery,
    setCustomQuery,
    
    // Dataset metadata
    name,
    setName,
    
    // Preview data
    previewData,
    setPreviewData,
    
    // Reset function
    resetState
  };
};
