
/**
 * Service for handling Shopify credential operations
 */

/**
 * Gets and validates Shopify credentials either from shopify_credentials table or source object
 */
export async function getShopifyCredentials(source, supabase) {
  // If source is not a Shopify source, return error
  if (source.source_type.toLowerCase() !== "shopify") {
    return {
      success: false,
      error: {
        message: "Only Shopify sources are supported currently",
        details: { provided_type: source.source_type }
      },
      status: 400,
      code: 'invalid_source_type'
    };
  }
  
  // Get Shopify credentials from the source
  if (!source.credentials) {
    console.error("Missing credentials in source:", source);
    return {
      success: false,
      error: {
        message: "Source credentials are missing or invalid",
        details: { credential_info: "Missing credentials" }
      },
      status: 400,
      code: 'invalid_credentials'
    };
  }
  
  // Use source ID as credential ID if it's not provided in the credentials
  const credentialId = source.credentials.credential_id || source.id;
  console.log("Using credential ID:", credentialId);
  
  // Get Shopify credentials
  const { data: shopifyCredentials, error: credentialsError } = await supabase
    .from("shopify_credentials")
    .select("*")
    .eq("id", credentialId)
    .maybeSingle(); // Use maybeSingle instead of single to handle cases where no record is found
  
  if (credentialsError) {
    console.error("Credentials error:", credentialsError);
    return {
      success: false,
      error: {
        message: "Error fetching Shopify credentials",
        details: credentialsError
      },
      status: 500,
      code: 'credentials_fetch_error'
    };
  }
  
  // If no credentials found in the shopify_credentials table, 
  // use the credentials directly from the source
  let storeCredentials = shopifyCredentials;
  
  if (!storeCredentials) {
    console.log("No record found in shopify_credentials table, using credentials from source");
    // Use the credentials directly from the source
    storeCredentials = {
      store_name: source.url || source.credentials.store_name,
      api_token: source.credentials.api_token || source.credentials.access_token,
      api_key: source.credentials.api_key || source.credentials.client_id,
      id: source.id
    };
  }
  
  // Validate required credentials
  if (!storeCredentials.store_name || (!storeCredentials.api_token && !source.credentials.access_token)) {
    console.error("Missing required Shopify credentials:", {
      hasStoreName: !!storeCredentials.store_name,
      hasApiToken: !!(storeCredentials.api_token || source.credentials.access_token)
    });
    
    return {
      success: false,
      error: {
        message: "Incomplete Shopify credentials (missing store name or API token)",
        details: {
          has_store_name: !!storeCredentials.store_name,
          has_api_token: !!(storeCredentials.api_token || source.credentials.access_token)
        }
      },
      status: 400,
      code: 'incomplete_credentials'
    };
  }
  
  // Extract all available credentials
  const credentials = {
    clientId: storeCredentials.api_key || source.credentials.client_id,
    clientSecret: storeCredentials.api_secret || source.credentials.client_secret,
    apiToken: storeCredentials.api_token || source.credentials.access_token,
    storeName: storeCredentials.store_name
  };
  
  // Log available credentials (safely, without exposing actual values)
  console.log("Using credentials:", {
    hasClientId: !!credentials.clientId,
    hasClientSecret: !!credentials.clientSecret,
    hasApiToken: !!credentials.apiToken,
    storeName: credentials.storeName
  });
  
  return {
    success: true,
    credentials
  };
}
