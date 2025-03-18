
import { devLogger } from '@/utils/DevLogger';

/**
 * Process preview data to standardize format
 */
export const processPreviewData = (data: any): any[] => {
  // For Shopify orders data
  if (data && data.orders) {
    return data.orders;
  }
  
  // Handle other data types
  if (Array.isArray(data)) {
    return data;
  }
  
  // Try to extract data from known paths
  if (data && typeof data === 'object') {
    // Check common data paths
    for (const key of ['data', 'results', 'items', 'records']) {
      if (data[key] && Array.isArray(data[key])) {
        return data[key];
      }
    }
    
    // If we can't find a specific array, return the object in an array
    return [data];
  }
  
  return [];
};

/**
 * Generate a small sample of data for quick preview
 */
export const generateDataSample = (data: any[]): string | null => {
  try {
    if (!data || data.length === 0) {
      return null;
    }
    
    // Take first 3 items, or fewer if not available
    const sampleItems = data.slice(0, 3);
    
    // Format the sample data nicely
    const formatted = JSON.stringify(sampleItems, null, 2);
    
    devLogger.info('Dataset Preview', 'Generated data sample', { 
      sampleSize: sampleItems.length 
    });
    
    return formatted;
  } catch (error) {
    console.error('Error generating data sample:', error);
    devLogger.error('Dataset Preview', 'Error generating data sample', error);
    return null;
  }
};
