
import { devLogger } from '@/utils/logger';
import { toast } from '@/hooks/use-toast';

/**
 * Error handling class for preview generation
 */
export class PreviewError {
  private error: unknown;

  constructor(error: unknown) {
    this.error = error;
  }

  /**
   * Format the error message based on error type and retry count
   */
  getFormattedError(retryCount: number): { errorMessage: string; shouldIncrementRetry: boolean } {
    let errorMessage = this.error instanceof Error ? this.error.message : 'Failed to generate preview';
    let shouldIncrementRetry = false;
    
    // Check if the error relates to Edge Function
    if (errorMessage.includes('Failed to fetch') || 
        errorMessage.includes('network') || 
        errorMessage.includes('ECONNREFUSED') ||
        errorMessage.includes('Failed to send a request to the Edge Function')) {
      errorMessage = 'Failed to connect to the Edge Function. This could be due to network connectivity issues or the function being temporarily unavailable. Please check your network connection and try again.';
      
      // Mark for retry count increment
      shouldIncrementRetry = true;
      
      // If we've tried less than 3 times, provide a retry suggestion
      if (retryCount < 3) {
        errorMessage += ' You can try refreshing the preview.';
      } else {
        errorMessage += ' The Edge Function might be experiencing issues. Please try again later or contact support if the problem persists.';
      }
    }
    
    return { errorMessage, shouldIncrementRetry };
  }
}

/**
 * Handle preview generation errors
 */
export const handlePreviewError = (
  error: unknown, 
  retryCount: number, 
  setPreviewError: (error: string | null) => void,
  setRetryCount: (updater: (prev: number) => number) => void
): void => {
  const errorHandler = new PreviewError(error);
  const { errorMessage, shouldIncrementRetry } = errorHandler.getFormattedError(retryCount);
  
  console.error('Error generating preview:', error);
  setPreviewError(errorMessage);
  
  devLogger.error('Dataset Preview', 'Preview generation failed', error);
  
  toast({
    title: 'Preview Generation Failed',
    description: errorMessage,
    variant: 'destructive',
  });
  
  if (shouldIncrementRetry) {
    setRetryCount(prev => prev + 1);
  }
};
