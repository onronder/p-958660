
import { getProductionCorsHeaders } from "../_shared/cors.ts";

/**
 * Detects the current Shopify API version
 * @param storeUrl Formatted Shopify store URL
 * @param accessToken Shopify access token
 * @returns Detected API version
 */
export async function detectShopifyApiVersion(
  storeUrl: string, 
  accessToken: string
): Promise<string> {
  try {
    // Call the admin GraphQL endpoint to get versions
    const versionsResponse = await fetch(`https://${storeUrl}/admin/api/graphql/versions.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    });
    
    if (!versionsResponse.ok) {
      console.warn(
        "Could not detect Shopify API version:", 
        versionsResponse.status, 
        await versionsResponse.text()
      );
      return "2023-10"; // Default to a known stable version as fallback
    }
    
    const versionsData = await versionsResponse.json();
    
    if (versionsData && versionsData.versions && versionsData.versions.length > 0) {
      // Use the latest supported version from Shopify's list
      const latestVersion = versionsData.versions[0];
      console.log("Detected latest Shopify API version:", latestVersion);
      return latestVersion;
    }
    
    // Fallback to a known stable version
    return "2023-10";
  } catch (error) {
    console.error("Error detecting Shopify API version:", error);
    return "2023-10"; // Default to a known stable version as fallback
  }
}

/**
 * Tests the connection to Shopify GraphQL API
 * @param storeUrl Formatted Shopify store URL
 * @param accessToken Shopify access token 
 * @param apiVersion API version to use
 * @returns Response indicating test result
 */
export async function testShopifyConnection(
  storeUrl: string,
  accessToken: string,
  apiVersion: string
): Promise<Response> {
  try {
    // Simple query to verify API access
    const testQuery = `{
      shop {
        name
        id
      }
    }`;
    
    const testResponse = await fetch(`https://${storeUrl}/admin/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify({ query: testQuery })
    });
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Could not connect to Shopify API: ${testResponse.status}`,
          details: errorText
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...getProductionCorsHeaders()
          } 
        }
      );
    }
    
    const testData = await testResponse.json();
    
    if (testData.errors) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "GraphQL query errors",
          details: testData.errors
        }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            ...getProductionCorsHeaders()
          } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Successfully connected to Shopify GraphQL API",
        shop: testData.data?.shop,
        api_version: apiVersion
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          ...getProductionCorsHeaders()
        } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Error testing connection: ${error.message}` 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...getProductionCorsHeaders()
        } 
      }
    );
  }
}
