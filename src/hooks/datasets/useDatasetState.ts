
import { useState } from "react";
import { Source } from "@/types/source";

/**
 * Hook for managing dataset creation state
 */
export const useDatasetState = () => {
  const [sourceId, setSourceId] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [datasetType, setDatasetType] = useState<"predefined" | "dependent" | "custom">("predefined");
  const [templateName, setTemplateName] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [name, setName] = useState("");
  const [previewData, setPreviewData] = useState<any[]>([]);
  
  const resetState = () => {
    setSourceId("");
    setSourceName("");
    setDatasetType("predefined");
    setTemplateName("");
    setCustomQuery("");
    setName("");
    setPreviewData([]);
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
