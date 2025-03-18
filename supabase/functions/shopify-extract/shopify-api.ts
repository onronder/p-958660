
/**
 * Executes a GraphQL query against the Shopify API
 */
export async function executeShopifyQuery({
  shopName,
  apiToken,
  query,
  variables,
  apiVersion
}) {
  try {
    // Ensure we have a valid API version
    if (!apiVersion) {
      console.warn("No API version provided, falling back to default 2025-01");
      apiVersion = "2025-01"; // Update to the latest known version
    }
    
    const endpoint = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/graphql.json`;
    
    console.log(`Executing Shopify query using API version: ${apiVersion}`);
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": apiToken
      },
      body: JSON.stringify({ query, variables })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: `Shopify API error: ${response.status} ${response.statusText}`,
        details: errorText,
        status: response.status
      };
    }
    
    const data = await response.json();
    
    // Handle GraphQL errors
    if (data.errors && data.errors.length > 0) {
      return {
        error: "GraphQL error",
        details: data.errors,
        status: 400
      };
    }
    
    return { data: data.data };
  } catch (error) {
    return {
      error: `Error executing Shopify query: ${error.message}`,
      status: 500
    };
  }
}
