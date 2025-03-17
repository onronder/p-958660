
/**
 * Helper function to extract results from GraphQL response
 */
export function extractResults(data: any): any[] {
  if (!data) return [];
  
  // Find the first property that has an edges array
  for (const key in data) {
    if (data[key] && data[key].edges && Array.isArray(data[key].edges)) {
      return data[key].edges.map((edge: any) => edge.node);
    }
  }
  
  return [];
}
