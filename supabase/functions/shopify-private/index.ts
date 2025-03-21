import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

Deno.serve(async (req) => {
  try {
    const { action, source_id, store_url, client_id, client_secret, access_token, api_key, api_token, user_id } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log(`Received request for action: ${action}`);
    
    // Handle different actions
    if (action === "test_connection") {
      // If a source_id is provided, fetch source details first
      let storeUrlToUse = store_url;
      let clientIdToUse = client_id || api_key;
      let clientSecretToUse = client_secret || api_token;
      let accessTokenToUse = access_token;
      let sourceData = null;
      
      if (source_id) {
        console.log(`Fetching source details for source_id: ${source_id}`);
        const { data, error } = await supabase
          .from('sources')
          .select('*')
          .eq('id', source_id)
          .single();
          
        if (error) {
          console.error('Error fetching source:', error);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to fetch source details',
              errorType: 'database_error',
              details: error 
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        sourceData = data;
        
        // Extract credentials from the source
        const credentials = sourceData.credentials || {};
        
        // Set URL and credentials from the source data
        storeUrlToUse = sourceData.url;
        clientIdToUse = credentials.client_id || credentials.api_key;
        clientSecretToUse = credentials.client_secret || credentials.api_token;
        accessTokenToUse = credentials.access_token;
        
        console.log(`Using source data - URL: ${storeUrlToUse}, Has Client ID: ${!!clientIdToUse}, Has Client Secret: ${!!clientSecretToUse}, Has Access Token: ${!!accessTokenToUse}`);
      }
      
      // Ensure we have the required parameters
      if (!storeUrlToUse) {
        return new Response(
          JSON.stringify({ 
            error: 'Store URL is required',
            errorType: 'missing_parameter' 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // We need at least client_id+client_secret OR access_token
      const hasClientCredentials = clientIdToUse && clientSecretToUse;
      const hasAccessToken = accessTokenToUse;
      
      if (!hasClientCredentials && !hasAccessToken) {
        return new Response(
          JSON.stringify({ 
            error: 'Either Client ID and Client Secret OR Access Token is required',
            errorType: 'missing_parameter' 
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      // Format the store URL if needed
      const formattedStoreUrl = storeUrlToUse.includes('.myshopify.com')
        ? storeUrlToUse
        : `${storeUrlToUse}.myshopify.com`;
        
      // Build the API URL for testing
      const apiUrl = `https://${formattedStoreUrl}/admin/api/2023-10/shop.json`;
      
      try {
        // Make the Shopify API request
        console.log(`Testing connection to: ${apiUrl}`);
        
        const headers = new Headers();
        
        // Set auth headers based on what we have
        if (hasAccessToken) {
          headers.set('X-Shopify-Access-Token', accessTokenToUse);
        }
        
        if (hasClientCredentials) {
          headers.set('X-Shopify-Client-Id', clientIdToUse);
          headers.set('X-Shopify-Client-Secret', clientSecretToUse);
        }
        
        // Make the API request
        const response = await fetch(apiUrl, { headers });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Shopify API error:', errorText);
          
          let errorType = 'api_error';
          if (response.status === 401) errorType = 'auth_error';
          if (response.status === 404) errorType = 'store_not_found';
          if (response.status === 403) errorType = 'permission_error';
          
          return new Response(
            JSON.stringify({ 
              error: `Failed to connect to Shopify API: ${response.status} ${response.statusText}`,
              errorType,
              details: errorText
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        // Parse the Shopify shop data
        const shopData = await response.json();
        console.log('Shopify connection successful:', JSON.stringify(shopData.shop));
        
        // If we have a source_id, update the source status
        if (source_id) {
          const { error: updateError } = await supabase
            .from('sources')
            .update({
              status: 'Active',
              updated_at: new Date().toISOString()
            })
            .eq('id', source_id);
            
          if (updateError) {
            console.error('Error updating source status:', updateError);
          } else {
            console.log(`Updated source status to Active for source_id: ${source_id}`);
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: true,
            shop: shopData.shop,
            message: 'Successfully connected to Shopify'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Error testing Shopify connection:', error);
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to connect to Shopify API',
            errorType: 'network_error',
            details: error.message
          }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } 
    
    // Other actions...
    
    // If no action matched
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in Shopify Private function:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
