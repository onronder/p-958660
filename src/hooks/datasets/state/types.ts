
export type StepType = 'source' | 'type' | 'configuration' | 'templates' | 'preview';

export interface DatasetState {
  currentStep: StepType;
  datasetType: 'predefined' | 'dependent' | 'custom';
  selectedSourceId: string;
  selectedSourceName: string;
  selectedSourceType: string;
  datasetName: string;
  selectedTemplate: string;
  selectedDependentTemplate: string;
  customQuery: string;
  previewData: any[];
  previewError: string | null;
  isPreviewLoading: boolean;
  connectionTestResult?: { success: boolean; message: string };
}

export interface DatasetStateActions {
  setCurrentStep: (step: StepType) => void;
  setDatasetType: (type: 'predefined' | 'dependent' | 'custom') => void;
  setSelectedSourceId: (id: string) => void;
  setSelectedSourceName: (name: string) => void;
  setSelectedSourceType: (type: string) => void;
  setDatasetName: (name: string) => void;
  setSelectedTemplate: (template: string) => void;
  setSelectedDependentTemplate: (template: string) => void;
  setCustomQuery: (query: string) => void;
  setPreviewData: (data: any[]) => void;
  setPreviewError: (error: string | null) => void;
  setIsPreviewLoading: (loading: boolean) => void;
  setConnectionTestResult: (result?: { success: boolean; message: string }) => void;
  goToNext: () => void;
  goToPrevious: () => void;
}

export type UseDatasetStateReturn = DatasetState & DatasetStateActions;
