
import { devLogger } from '@/utils/logger';
import { predefinedPreviewActions, customPreviewActions, dependentPreviewActions } from './actions';

/**
 * Actions for generating dataset previews
 */
export const previewActions = {
  /**
   * Generate a preview based on dataset type
   */
  generatePreviewByType: async (
    datasetType: string,
    sourceId: string,
    selectedTemplate: string,
    selectedDependentTemplate?: string,
    customQuery?: string
  ) => {
    devLogger.info('Dataset Preview', 'Generating preview by type', {
      datasetType,
      sourceId,
      hasTemplate: !!selectedTemplate,
      hasDependentTemplate: !!selectedDependentTemplate,
      hasCustomQuery: !!customQuery
    });

    switch (datasetType) {
      case 'predefined':
        return await predefinedPreviewActions.generatePreview(selectedTemplate, sourceId);
      case 'dependent':
        return await dependentPreviewActions.generatePreview(selectedDependentTemplate, sourceId);
      case 'custom':
        return await customPreviewActions.generatePreview(sourceId, customQuery);
      default:
        throw new Error(`Unknown dataset type: ${datasetType}`);
    }
  },

  // Re-export the specific preview actions for direct access if needed
  generatePredefinedPreview: predefinedPreviewActions.generatePreview,
  generateDependentPreview: dependentPreviewActions.generatePreview,
  generateCustomPreview: customPreviewActions.generatePreview
};
