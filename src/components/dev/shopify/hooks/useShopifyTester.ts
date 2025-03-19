
import { useState } from 'react';
import { useShopifySources } from './useShopifySources';
import { useShopifyTestExecution } from './useShopifyTestExecution';
import { TEST_QUERY_SIMPLE } from '../constants/queryTemplates';

export { TEST_QUERY_SIMPLE, TEST_QUERY_PRODUCTS } from '../constants/queryTemplates';

export const useShopifyTester = () => {
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

  const [query, setQuery] = useState(TEST_QUERY_SIMPLE);

  const executeQuery = () => {
    executeDirectQuery(selectedSourceId, query);
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
    executeDirectQuery: executeQuery,
    downloadResults
  };
};
