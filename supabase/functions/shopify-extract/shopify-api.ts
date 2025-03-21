
/**
 * Executes a GraphQL query against the Shopify Admin API
 */
export async function executeShopifyQuery({
  shopName,
  apiToken,
  clientId,
  clientSecret,
  query,
  variables,
  apiVersion = "2023-10",
  timeout = 30000 // Default timeout of 30 seconds
}) {
  try {
    if (!shopName || !apiToken) {
      return {
        error: "Missing required Shopify credentials",
        status: 400,
        details: {
          missingStoreName: !shopName,
          missingApiToken: !apiToken
        }
      };
    }

    if (!query) {
      return {
        error: "No GraphQL query provided",
        status: 400
      };
    }

    console.log(`Executing Shopify GraphQL query for ${shopName}`);
    console.log(`Using API version: ${apiVersion}`);
    console.log(`Available credential types:`, {
      hasApiToken: !!apiToken,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret
    });

    // Construct the Shopify API URL
    const shopifyUrl = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/graphql.json`;
    
    // Log query size and variables
    console.log(`Query size: ${query.length} characters`);
    console.log(`Variables:`, JSON.stringify(variables));

    // Create a promise that will reject after the timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Request timed out after ${timeout}ms`)), timeout);
    });

    // Create the fetch request
    const fetchPromise = fetch(shopifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": apiToken,
        // Include additional credentials in headers if available
        ...(clientId ? {"X-Shopify-Client-ID": clientId} : {}),
      },
      body: JSON.stringify({ query, variables })
    });

    // Race the fetch against the timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);
    
    console.log(`Shopify API response status: ${response.status}`);

    if (!response.ok) {
      // Try to extract the error text
      let errorText;
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = "Could not extract error text from response";
      }

      // Log detailed error information
      console.error(`Shopify API error (${response.status}): ${errorText}`);
      console.error(`Response headers:`, Object.fromEntries(response.headers.entries()));

      return {
        error: `Shopify API returned ${response.status}: ${response.statusText}`,
        status: response.status,
        details: {
          errorText,
          headers: Object.fromEntries(response.headers.entries())
        }
      };
    }

    // Parse the JSON response
    const result = await response.json();

    // Handle GraphQL errors
    if (result.errors) {
      console.error("GraphQL errors from Shopify API:", result.errors);
      return {
        error: "GraphQL errors from Shopify API",
        status: 400,
        details: result.errors
      };
    }

    console.log("Shopify API query executed successfully");
    return { data: result.data };
  } catch (error) {
    console.error(`Error executing Shopify GraphQL query:`, error);

    // Classify the error
    let errorType = "unknown";
    let status = 500;

    if (error.message.includes("timed out") || error.message.includes("timeout")) {
      errorType = "timeout";
      status = 408;
    } else if (error.message.includes("fetch") || error.message.includes("network")) {
      errorType = "network";
      status = 503;
    } else if (error.message.includes("JSON")) {
      errorType = "parsing";
      status = 400;
    }

    return {
      error: `Failed to execute Shopify query: ${error.message}`,
      status,
      details: {
        type: errorType,
        stack: error.stack
      }
    };
  }
}
