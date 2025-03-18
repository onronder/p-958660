
/**
 * Validates if the required parameters for dataset preview are present
 */
export const validatePreviewParams = (params: {
  sourceId?: string;
  datasetType?: "predefined" | "dependent" | "custom";
  templateName?: string;
  customQuery?: string;
}): { isValid: boolean; errorMessage?: string } => {
  const { sourceId, datasetType, templateName, customQuery } = params;
  
  if (!sourceId) {
    return { 
      isValid: false, 
      errorMessage: "Please select a source first" 
    };
  }

  if (!datasetType) {
    return { 
      isValid: false, 
      errorMessage: "Please select a dataset type" 
    };
  }

  if ((datasetType === "predefined" || datasetType === "dependent") && !templateName) {
    return { 
      isValid: false, 
      errorMessage: "Please select a template" 
    };
  }

  if (datasetType === "custom" && !customQuery) {
    return { 
      isValid: false, 
      errorMessage: "Please enter a custom query" 
    };
  }

  return { isValid: true };
};

/**
 * Helper to get effective parameter values from state or session storage
 */
export const getEffectiveParams = (params: {
  sourceId?: string;
  datasetType?: "predefined" | "dependent" | "custom";
  templateName?: string;
  customQuery?: string;
}) => {
  const { sourceId, datasetType, templateName, customQuery } = params;
  
  return {
    effectiveSourceId: sourceId || JSON.parse(sessionStorage.getItem('dataset_sourceId_backup') || 'null'),
    effectiveDatasetType: datasetType || JSON.parse(sessionStorage.getItem('dataset_datasetType_backup') || 'null'),
    effectiveTemplateName: templateName || JSON.parse(sessionStorage.getItem('dataset_templateName_backup') || 'null'),
    effectiveCustomQuery: customQuery || JSON.parse(sessionStorage.getItem('dataset_customQuery_backup') || 'null')
  };
};
