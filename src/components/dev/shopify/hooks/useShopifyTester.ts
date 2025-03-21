
import { useState } from 'react';
import { useShopifySources } from './useShopifySources';
import { useShopifyTestExecution } from './useShopifyTestExecution';
import { getQueryTemplates } from '../constants/queryTemplates';

export const useShopifyTester = () => {
  const [query, setQuery] = useState<string>(getQueryTemplates()[0].query);
  
  const {
    sources,
    selectedSourceId,
    setSelectedSourceId,
    isLoadingSources,
    loadSources
  } = useShopifySources();
  
  const {
    isExecuting,
    testOutput,
    executeDirectQuery,
    downloadResults
  } = useShopifyTestExecution();

  const handleExecuteQuery = () => {
    if (selectedSourceId) {
      executeDirectQuery(selectedSourceId, query);
    }
  };

  return {
    sources,
    selectedSourceId,
    setSelectedSourceId,
    isLoadingSources,
    query,
    setQuery,
    isExecuting,
    testOutput,
    loadSources,
    executeDirectQuery: handleExecuteQuery,
    downloadResults
  };
};
