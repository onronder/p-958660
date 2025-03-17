
import { useState } from "react";
import { Source } from "@/types/source";

/**
 * Hook for managing dataset creation state
 */
export const useDatasetState = () => {
  // Use sessionStorage to persist state between page navigations
  const getStoredState = <T>(key: string, defaultValue: T): T => {
    const stored = sessionStorage.getItem(`dataset_${key}`);
    return stored ? JSON.parse(stored) : defaultValue;
  };

  const setStoredState = <T>(key: string, value: T) => {
    sessionStorage.setItem(`dataset_${key}`, JSON.stringify(value));
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
  
  // Wrapper setters that also update sessionStorage
  const setSourceId = (id: string) => {
    console.log("Setting sourceId in storage:", id);
    setSourceIdState(setStoredState('sourceId', id));
  };
  
  const setSourceName = (name: string) => {
    setSourceNameState(setStoredState('sourceName', name));
  };
  
  const setDatasetType = (type: "predefined" | "dependent" | "custom") => {
    setDatasetTypeState(setStoredState('datasetType', type));
  };
  
  const setTemplateName = (name: string) => {
    setTemplateNameState(setStoredState('templateName', name));
  };
  
  const setCustomQuery = (query: string) => {
    setCustomQueryState(setStoredState('customQuery', query));
  };
  
  const setName = (name: string) => {
    setNameState(setStoredState('name', name));
  };
  
  const setPreviewData = (data: any[]) => {
    setPreviewDataState(setStoredState('previewData', data));
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
