
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Detects the current Shopify API version
 * @param storeUrl Formatted Shopify store URL
 * @param accessToken Shopify access token
 * @returns The detected API version or fallback version
 */
export async function detectShopifyApiVersion(
  storeUrl: string,
  accessToken: string
): Promise<string> {
  try {
    console.log("Detecting current Shopify API version...");
    
    // Make a request to determine the current API version
    const versionResponse = await fetch(`https://${storeUrl}/admin/api.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken
      }
    });
    
    if (!versionResponse.ok) {
      console.warn("Failed to detect API version, fallback to 2025-01");
      return "2025-01";  // Default fallback
    }
    
    const versionData = await versionResponse.json();
    
    if (versionData && versionData.supported_versions && versionData.supported_versions.length > 0) {
      // Get the latest stable version (first in the list is usually the latest)
      const latestVersion = versionData.supported_versions.find(v => v.status === "stable") || 
                          versionData.supported_versions[0];
      const apiVersion = latestVersion.version;
      console.log("Detected latest Shopify API version:", apiVersion);
      return apiVersion;
    } else {
      console.warn("Unable to parse API version response, using fallback");
      return "2025-01";  // Default fallback
    }
  } catch (versionError) {
    console.error("Error detecting API version:", versionError);
    return "2025-01";  // Default fallback
  }
}

/**
 * Tests connection to Shopify GraphQL API
 * @param storeUrl Formatted Shopify store URL
 * @param accessToken Shopify access token
 * @param apiVersion Detected API version
 * @returns Response with success or error message
 */
export async function testShopifyConnection(
  storeUrl: string,
  accessToken: string,
  apiVersion: string
): Promise<Response> {
  console.log("Testing connection to:", storeUrl, "using API version:", apiVersion);
  
  // Simple introspection query to test the connection
  const testQuery = `
    {
      __schema {
        queryType {
          name
        }
      }
    }
  `;
  
  try {
    const response = await fetch(`https://${storeUrl}/admin/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify({ query: testQuery })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Shopify API error:", response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to connect to Shopify GraphQL API", 
          details: errorText 
        }),
        { 
          status: 422, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Connection successful
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Successfully connected to Shopify GraphQL API",
        api_version: apiVersion
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error testing Shopify connection:", error);
    
    return new Response(
      JSON.stringify({ error: `Error connecting to Shopify: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}
