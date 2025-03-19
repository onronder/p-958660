
/**
 * Interface for preview results
 */
export interface PreviewResult {
  data: any[];
  sample: string | null;
  error: string | null;
}

/**
 * Interface for preview generation options
 */
export interface PreviewGenerationOptions {
  datasetType: string;
  sourceId: string;
  selectedTemplate: string;
  selectedDependentTemplate?: string;
  customQuery?: string;
}
