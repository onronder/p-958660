
import { useState, useEffect } from "react";
import { getStoredState, setStoredState, clearStoredState } from "./storageUtils";

/**
 * Core hook for dataset state management using session storage persistence
 */
export const useDatasetStateCore = () => {
  // Initialize state values from session storage
  const [sourceId, setSourceIdState] = useState(() => getStoredState('sourceId', ''));
  const [sourceName, setSourceNameState] = useState(() => getStoredState('sourceName', ''));
  const [datasetType, setDatasetTypeState] = useState<"predefined" | "dependent" | "custom">(() => 
    getStoredState('datasetType', 'predefined') as "predefined" | "dependent" | "custom"
  );
  const [templateName, setTemplateNameState] = useState(() => getStoredState('templateName', ''));
  const [customQuery, setCustomQueryState] = useState(() => getStoredState('customQuery', ''));
  const [name, setNameState] = useState(() => getStoredState('name', ''));
  const [previewData, setPreviewDataState] = useState<any[]>(() => getStoredState('previewData', []));
  
  // Debug log state on init
  useEffect(() => {
    console.log("useDatasetState: Initial state loaded", {
      sourceId,
      sourceName,
      datasetType,
      templateName,
      customQuery,
      backupSourceId: sessionStorage.getItem('dataset_sourceId_backup'),
      backupSourceName: sessionStorage.getItem('dataset_sourceName_backup'),
      backupDatasetType: sessionStorage.getItem('dataset_datasetType_backup'),
      backupTemplateName: sessionStorage.getItem('dataset_templateName_backup')
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
    console.log("Setting templateName in storage:", name);
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
    clearStoredState();
    
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
    // State values
    sourceId,
    sourceName,
    datasetType,
    templateName, 
    customQuery,
    name,
    previewData,
    
    // State setters
    setSourceId,
    setSourceName,
    setDatasetType,
    setTemplateName,
    setCustomQuery,
    setName,
    setPreviewData,
    
    // Reset function
    resetState
  };
};
