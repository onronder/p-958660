
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
    // Parse the request
    const { limit = 50, days = 30, status = 'any', cursor, source_id } = await req.json() as OrdersQueryParams

    // Create a Supabase client
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
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
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if source_id is provided
    if (!source_id) {
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
      return new Response(JSON.stringify({ error: 'Source not found or unauthorized', details: sourceError }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if the source is Shopify
    if (sourceData.source_type !== 'shopify') {
      return new Response(JSON.stringify({ error: 'Source must be a Shopify store' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Extract Shopify credentials from the source
    const shopifyCredentials = sourceData.credentials;
    if (!shopifyCredentials || !shopifyCredentials.store_name || !shopifyCredentials.api_token) {
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
    
    // Variables for the GraphQL query
    const variables = {
      first: Math.min(limit, 250), // Maximum of 250 per request
      after: cursor || null,
      query: queryString
    }

    console.log(`Making request to Shopify API for store: ${shopifyCredentials.store_name}`);
    console.log(`Query: ${queryString}`);

    // Make the request to Shopify
    const shopifyUrl = `https://${shopifyCredentials.store_name}.myshopify.com/admin/api/2023-10/graphql.json`;
    const response = await fetch(shopifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': shopifyCredentials.api_token,
      },
      body: JSON.stringify({ query, variables }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Shopify API error: ${errorText}`);
      
      // Log the error
      await supabase
        .from('shopify_logs')
        .insert([
          {
            user_id: user.id,
            store_name: shopifyCredentials.store_name,
            error_message: `API Error: ${response.status}`,
            error_details: { errorText, query: queryString },
            api_key: shopifyCredentials.api_key || null,
            http_status: response.status
          },
        ])
      
      return new Response(JSON.stringify({ error: 'Shopify API error', details: errorText }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = await response.json()

    // Check for GraphQL errors
    if (result.errors) {
      console.error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      
      // Log the error
      await supabase
        .from('shopify_logs')
        .insert([
          {
            user_id: user.id,
            store_name: shopifyCredentials.store_name,
            error_message: 'GraphQL Error',
            error_details: result.errors,
            api_key: shopifyCredentials.api_key || null
          },
        ])
      
      return new Response(JSON.stringify({ error: 'GraphQL errors', details: result.errors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Process the orders data
    const orders = result.data?.orders?.edges.map((edge: any) => edge.node) || []
    const pageInfo = result.data?.orders?.pageInfo || {}

    console.log(`Retrieved ${orders.length} orders successfully`);

    // Save the dataset in user_datasets table
    if (!cursor) {  // Only save on first request, not for pagination
      const { data: datasetData, error: datasetError } = await supabase
        .from('user_datasets')
        .insert([
          {
            user_id: user.id,
            source_id: source_id,
            template_id: (await supabase
              .from('pre_datasettemplate')
              .select('id')
              .eq('template_key', 'recent_orders_dashboard')
              .single()).data?.id,
            name: `Recent Orders - ${new Date().toISOString().split('T')[0]}`,
            description: `Recent orders from the past ${days} days${status !== 'any' ? ` with status "${status}"` : ''}`,
            dataset_type: 'predefined',
            query_params: { limit, days, status },
            result_data: { orders, pageInfo },
            status: 'completed',
            record_count: orders.length
          }
        ])
        .select()
        .single()

      if (datasetError) {
        console.error(`Error saving dataset: ${JSON.stringify(datasetError)}`);
      } else {
        console.log(`Saved dataset with ID: ${datasetData.id}`);
      }
    }

    // Log the operation
    await supabase
      .from('shopify_logs')
      .insert([
        {
          user_id: user.id,
          store_name: shopifyCredentials.store_name,
          api_key: shopifyCredentials.api_key || null,
          error_message: null,
          error_details: { operation: 'fetch_recent_orders', days, status, count: orders.length }
        },
      ])

    // Return the processed data
    return new Response(
      JSON.stringify({
        orders,
        pageInfo,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error(`Unexpected error: ${error.message}`);
    console.error(error.stack);
    
    // Handle any unexpected errors
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
