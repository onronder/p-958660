
/**
 * Execute a GraphQL query against the Shopify Admin API
 */
export async function executeShopifyQuery({
  shopName,
  clientId,
  clientSecret,
  apiToken,
  query,
  variables = {},
  apiVersion = '2023-10'
}) {
  try {
    // Validate inputs
    if (!shopName) {
      console.error("Missing shopName in executeShopifyQuery");
      return { error: "Missing shop name", status: 400 };
    }
    
    if (!apiToken) {
      console.error("Missing apiToken in executeShopifyQuery");
      return { error: "Missing API token", status: 400 };
    }
    
    if (!query) {
      console.error("Missing query in executeShopifyQuery");
      return { error: "Missing GraphQL query", status: 400 };
    }
    
    // Ensure shop name is properly formatted
    const formattedShopName = shopName.includes('.myshopify.com') 
      ? shopName 
      : `${shopName}.myshopify.com`;
    
    const url = `https://${formattedShopName}/admin/api/${apiVersion}/graphql.json`;
    
    console.log(`Executing Shopify GraphQL query to: ${url}`);
    console.log(`Using credentials - Client ID: ${clientId ? 'provided' : 'missing'}, Client Secret: ${clientSecret ? 'provided' : 'missing'}, API Token: ${apiToken ? 'provided' : 'missing'}`);
    
    // Prepare request headers with all available credentials
    const headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': apiToken
    };
    
    // Add optional authentication parameters if available
    if (clientId) {
      headers['X-Shopify-Client-Id'] = clientId;
    }
    
    if (clientSecret) {
      headers['X-Shopify-Client-Secret'] = clientSecret;
    }
    
    // Make the request to Shopify GraphQL API
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        variables
      })
    });
    
    // Log response status
    console.log(`Shopify API response status: ${response.status}`);
    
    // Handle non-200 responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Shopify API error response:', errorText);
      
      try {
        // Try to parse as JSON
        const errorJson = JSON.parse(errorText);
        return {
          error: 'Shopify API request failed',
          details: errorJson,
          status: response.status
        };
      } catch (e) {
        // If not JSON, return the raw text
        return {
          error: 'Shopify API request failed',
          details: errorText,
          status: response.status
        };
      }
    }
    
    const data = await response.json();
    
    // Handle GraphQL errors
    if (data.errors) {
      console.error('Shopify GraphQL errors:', data.errors);
      return {
        error: 'GraphQL query execution failed',
        details: data.errors,
        status: 400
      };
    }
    
    return { data: data.data };
  } catch (error) {
    console.error('Exception in executeShopifyQuery:', error);
    return {
      error: `Failed to execute Shopify GraphQL query: ${error.message}`,
      status: 500
    };
  }
}
