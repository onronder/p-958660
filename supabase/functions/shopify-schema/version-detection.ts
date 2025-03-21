
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
    console.log("Detecting latest Shopify API version for store:", storeUrl);
    
    // Call the admin API versions endpoint to get current versions
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
      // If we can't detect the version, use the current stable version
      return "2023-10"; // Default fallback version
    }
    
    const versionsData = await versionsResponse.json();
    
    if (versionsData && versionsData.versions && versionsData.versions.length > 0) {
      // Use the latest supported version from Shopify's list
      // The first version in the list is always the most recent
      const latestVersion = versionsData.versions[0];
      console.log("✅ Detected latest Shopify API version:", latestVersion);
      return latestVersion;
    }
    
    // Fallback to a known stable version if we can't parse the response
    console.log("⚠️ Could not parse Shopify API versions, using fallback version");
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
 * @param clientId Shopify client ID (optional)
 * @param clientSecret Shopify client secret (optional)
 * @returns Response indicating test result
 */
export async function testShopifyConnection(
  storeUrl: string,
  accessToken: string,
  apiVersion: string,
  clientId?: string,
  clientSecret?: string
): Promise<Response> {
  try {
    // Simple query to verify API access
    const testQuery = `{
      shop {
        name
        id
        email
        primaryDomain {
          url
        }
        plan {
          displayName
          partnerDevelopment
          shopifyPlus
        }
      }
    }`;
    
    console.log(`Testing Shopify GraphQL connection to ${storeUrl} using API version: ${apiVersion}`);
    
    // Prepare headers with all available credentials
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': accessToken
    };
    
    // Add client ID and secret if available
    if (clientId) {
      headers['X-Shopify-Client-Id'] = clientId;
    }
    
    if (clientSecret) {
      headers['X-Shopify-Client-Secret'] = clientSecret;
    }
    
    // Log headers for debugging (without exposing actual values)
    console.log('Request headers:', Object.keys(headers));
    
    const testResponse = await fetch(`https://${storeUrl}/admin/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: testQuery })
    });
    
    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error(`❌ Shopify API connection test failed (HTTP ${testResponse.status}):`, errorText);
      
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
            ...getProductionCorsHeaders(null)
          } 
        }
      );
    }
    
    const testData = await testResponse.json();
    
    if (testData.errors) {
      console.error("❌ Shopify GraphQL query errors:", testData.errors);
      
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
            ...getProductionCorsHeaders(null)
          } 
        }
      );
    }
    
    console.log("✅ Successfully connected to Shopify GraphQL API");
    
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
          ...getProductionCorsHeaders(null)
        } 
      }
    );
  } catch (error) {
    console.error("❌ Error testing Shopify connection:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Error testing connection: ${error.message}` 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...getProductionCorsHeaders(null)
        } 
      }
    );
  }
}
