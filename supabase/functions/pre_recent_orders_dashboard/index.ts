
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrdersQueryParams {
  limit?: number;
  days?: number;
  status?: string;
  cursor?: string;
  source_id?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting pre_recent_orders_dashboard function')
    // Parse the request
    const { limit = 50, days = 30, status = 'any', cursor, source_id } = await req.json() as OrdersQueryParams
    
    // Log request parameters for debugging
    console.log('Request parameters:', { limit, days, status, hasCursor: !!cursor, source_id })

    // Create a Supabase client
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('Missing Authorization header')
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get user from the request
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error('User not found in authentication context')
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if source_id is provided
    if (!source_id) {
      console.error('Source ID is missing in request')
      return new Response(JSON.stringify({ error: 'Source ID is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fetch the source details
    const { data: sourceData, error: sourceError } = await supabase
      .from('sources')
      .select('*')
      .eq('id', source_id)
      .eq('user_id', user.id)
      .single()

    if (sourceError || !sourceData) {
      console.error('Source error:', sourceError)
      return new Response(JSON.stringify({ error: 'Source not found or unauthorized', details: sourceError }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if the source is Shopify
    if (sourceData.source_type !== 'shopify') {
      console.error(`Invalid source type: ${sourceData.source_type}`)
      return new Response(JSON.stringify({ error: 'Source must be a Shopify store' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Extract Shopify credentials from the source
    const shopifyCredentials = sourceData.credentials;
    if (!shopifyCredentials) {
      console.error('Missing Shopify credentials')
      return new Response(JSON.stringify({ error: 'Missing Shopify credentials in source' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Extract and validate all possible credential fields
    const storeName = shopifyCredentials.store_name;
    const apiToken = shopifyCredentials.api_token || shopifyCredentials.access_token;
    const clientId = shopifyCredentials.client_id || shopifyCredentials.api_key;
    const clientSecret = shopifyCredentials.client_secret || shopifyCredentials.api_secret;
    
    // Log available credential fields (safely)
    console.log('Credential verification:', {
      hasStoreName: !!storeName,
      hasApiToken: !!apiToken,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret
    });

    if (!storeName || !apiToken) {
      console.error('Invalid Shopify credentials in source', {
        hasStoreName: !!storeName,
        hasApiToken: !!apiToken
      })
      return new Response(JSON.stringify({ error: 'Invalid Shopify credentials in source' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Construct the GraphQL query for recent orders
    const query = `
      query GetRecentOrders($first: Int!, $after: String, $query: String) {
        orders(first: $first, after: $after, query: $query) {
          pageInfo {
            hasNextPage
            endCursor
          }
          edges {
            node {
              id
              name
              createdAt
              processedAt
              displayFinancialStatus
              displayFulfillmentStatus
              subtotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalShippingPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalTaxSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                id
                displayName
                email
                phone
              }
              shippingAddress {
                address1
                address2
                city
                province
                country
                zip
                name
              }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                    originalTotalSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
              tags
              note
            }
          }
        }
      }
    `

    // Construct the query string based on parameters
    const queryString = `created_at:>-${days}d${status !== 'any' ? ` status:${status}` : ''}`
    
    // Variables for the GraphQL query - Strictly limit preview data
    const actualLimit = Math.min(limit, 5); // Enforce a hard limit of 5 for preview
    const variables = {
      first: actualLimit,
      after: cursor || null,
      query: queryString
    }

    console.log(`Making request to Shopify API for store: ${storeName}`);
    console.log(`Query: ${queryString}`);
    console.log(`Limit: ${actualLimit} records`);

    // Make the request to Shopify
    const shopifyUrl = `https://${storeName}.myshopify.com/admin/api/2023-10/graphql.json`;
    
    try {
      console.log('Sending GraphQL request to Shopify');
      
      const response = await fetch(shopifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Access-Token': apiToken,
        },
        body: JSON.stringify({ query, variables }),
      });

      // Log response status
      console.log(`Shopify API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Shopify API error: ${errorText}`);
        console.error('Response details:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Log the error with detailed context
        await supabase
          .from('shopify_logs')
          .insert([
            {
              user_id: user.id,
              store_name: storeName,
              error_message: `API Error: ${response.status}`,
              error_details: { 
                errorText, 
                query: queryString,
                responseStatus: response.status,
                responseStatusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
              },
              api_key: clientId || null,
              http_status: response.status
            },
          ]);
        
        return new Response(JSON.stringify({ 
          error: 'Shopify API error', 
          details: errorText,
          status: response.status,
          statusText: response.statusText
        }), {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const result = await response.json();

      // Check for GraphQL errors
      if (result.errors) {
        console.error(`GraphQL errors:`, result.errors);
        
        // Log the error
        await supabase
          .from('shopify_logs')
          .insert([
            {
              user_id: user.id,
              store_name: storeName,
              error_message: 'GraphQL Error',
              error_details: result.errors,
              api_key: clientId || null
            },
          ]);
        
        return new Response(JSON.stringify({ error: 'GraphQL errors', details: result.errors }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Process the orders data
      const orders = result.data?.orders?.edges.map((edge: any) => edge.node) || [];
      const pageInfo = result.data?.orders?.pageInfo || {};

      console.log(`Retrieved ${orders.length} orders successfully`);

      // Generate a formatted sample for preview display
      const sample = orders.length > 0 
        ? JSON.stringify(orders.slice(0, Math.min(3, orders.length)), null, 2)
        : null;

      // First, return the preview data with minimal processing
      if (cursor) {
        // For pagination requests, just return the data directly
        console.log('Returning paginated data without saving to database');
        return new Response(
          JSON.stringify({
            orders,
            pageInfo,
            preview: true,
            sample
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // For initial requests, generate a preview dataset ID but don't wait for the save
      const { data: initialDataset, error: initialError } = await supabase
        .from('user_datasets')
        .insert([
          {
            user_id: user.id,
            source_id: source_id,
            template_id: null, // We'll update this in the background
            name: `Recent Orders - ${new Date().toISOString().split('T')[0]}`,
            description: `Recent orders from the past ${days} days${status !== 'any' ? ` with status "${status}"` : ''}`,
            dataset_type: 'predefined',
            query_params: { limit, days, status },
            status: 'preview_generated', // Mark initially as preview only
            record_count: orders.length
          }
        ])
        .select('id')
        .single();

      if (initialError) {
        console.error(`Error creating initial dataset record: ${JSON.stringify(initialError)}`);
      } else {
        console.log(`Created initial dataset with ID: ${initialDataset.id}`);
      }

      // Return the preview data immediately
      console.log('Returning preview data immediately');
      const datasetId = initialDataset?.id || null;
      
      // Log the operation
      await supabase
        .from('shopify_logs')
        .insert([
          {
            user_id: user.id,
            store_name: storeName,
            api_key: clientId || null,
            error_message: null,
            error_details: { operation: 'fetch_recent_orders_preview', days, status, count: orders.length }
          },
        ]);

      // Then, in the background, complete the full dataset save
      if (datasetId) {
        console.log(`Starting background task to save full dataset for ID: ${datasetId}`);
        
        // Use waitUntil to handle background processing
        EdgeRuntime.waitUntil((async () => {
          try {
            console.log(`Background task: getting template ID`);
            const templateResult = await supabase
              .from('pre_datasettemplate')
              .select('id')
              .eq('template_key', 'recent_orders_dashboard')
              .single();
            
            console.log(`Background task: updating dataset ${datasetId} with complete data`);
            
            await supabase
              .from('user_datasets')
              .update({ 
                template_id: templateResult.data?.id,
                result_data: { orders, pageInfo },
                status: 'completed'
              })
              .eq('id', datasetId);
              
            console.log(`Background task completed: Dataset ${datasetId} saved successfully`);
          } catch (bgError) {
            console.error(`Background task error: ${bgError.message}`);
            
            // Log background task error
            await supabase
              .from('shopify_logs')
              .insert([
                {
                  user_id: user.id,
                  store_name: storeName,
                  api_key: clientId || null,
                  error_message: 'Background task error',
                  error_details: { message: bgError.message, stack: bgError.stack }
                },
              ]).catch(e => console.error('Failed to log background error:', e));
          }
        })());
      }

      // Return the processed data
      return new Response(
        JSON.stringify({
          orders,
          pageInfo,
          dataset_id: datasetId,
          sample,
          preview: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (fetchError) {
      // Handle specific error types
      console.error(`Fetch error: ${fetchError.message}`);
      
      let errorStatus = 500;
      let errorMessage = fetchError.message;
      
      // Classify error types for better user feedback
      if (fetchError.message.includes('timeout') || fetchError.message.includes('timed out')) {
        errorStatus = 408;
        errorMessage = 'Request to Shopify API timed out. The dataset might be too large or the connection is slow.';
      } else if (fetchError.message.includes('ENOTFOUND') || fetchError.message.includes('getaddrinfo')) {
        errorStatus = 503;
        errorMessage = 'Could not connect to Shopify API. Please check your internet connection and try again.';
      } else if (fetchError.message.includes('certificate') || fetchError.message.includes('SSL')) {
        errorStatus = 525;
        errorMessage = 'SSL certificate verification failed when connecting to Shopify API.';
      }
      
      // Log detailed error information
      await supabase
        .from('shopify_logs')
        .insert([
          {
            user_id: user.id,
            store_name: storeName,
            error_message: errorMessage,
            error_details: { 
              message: fetchError.message,
              stack: fetchError.stack,
              name: fetchError.name,
              queryParams: { limit, days, status }
            },
            api_key: clientId || null,
            http_status: errorStatus
          },
        ]);
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          type: 'fetch_error',
          details: fetchError.stack
        }),
        {
          status: errorStatus,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    console.error(error.stack);
    
    // Handle any unexpected errors
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        stack: error.stack,
        type: 'unexpected_error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
})
