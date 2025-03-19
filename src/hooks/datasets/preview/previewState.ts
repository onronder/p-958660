
import { useState } from 'react';
import { ConnectionTestResult } from './useConnectionTest';

/**
 * Hook to manage dataset preview state
 */
export const usePreviewState = () => {
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewSample, setPreviewSample] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionTestResult, setConnectionTestResult] = useState<ConnectionTestResult | null>(null);
  
  /**
   * Reset preview state
   */
  const resetPreviewState = () => {
    setPreviewError(null);
    setPreviewData([]);
    setPreviewSample(null);
  };
  
  /**
   * Set loading state
   */
  const setLoading = (loading: boolean) => {
    setIsPreviewLoading(loading);
  };
  
  /**
   * Reset retry count
   */
  const resetRetryCount = () => {
    setRetryCount(0);
  };
  
  return {
    // State
    isPreviewLoading,
    previewData,
    previewError,
    previewSample,
    retryCount,
    connectionTestResult,
    
    // Setters
    setIsPreviewLoading: setLoading,
    setPreviewData,
    setPreviewError,
    setPreviewSample,
    setRetryCount,
    setConnectionTestResult,
    
    // Actions
    resetPreviewState,
    resetRetryCount
  };
};
