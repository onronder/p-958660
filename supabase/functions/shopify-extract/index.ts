
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders, getProductionCorsHeaders } from "../_shared/cors.ts";
import { validateUser, createSupabaseClient } from "../oauth-callback/helpers.ts";

serve(async (req: Request) => {
  // Handle CORS preflight requests
  const requestOrigin = req.headers.get("origin");
  const responseCorsHeaders = getProductionCorsHeaders(requestOrigin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: responseCorsHeaders });
  }

  try {
    const supabase = createSupabaseClient();
    
    // Get user from authorization header
    const authHeader = req.headers.get("authorization");
    const user = await validateUser(supabase, authHeader?.replace("Bearer ", ""));
    
    // Parse request body
    const { 
      extraction_id, 
      preview_only = false, 
      limit = preview_only ? 3 : 250
    } = await req.json();
    
    if (!extraction_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: extraction_id" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // Get extraction details
    const { data: extraction, error: extractionError } = await supabase
      .from("extractions")
      .select("*")
      .eq("id", extraction_id)
      .eq("user_id", user.id)
      .single();
    
    if (extractionError || !extraction) {
      return new Response(
        JSON.stringify({ error: "Extraction not found or not authorized" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // Get source details
    const { data: source, error: sourceError } = await supabase
      .from("sources")
      .select("*")
      .eq("id", extraction.source_id)
      .eq("user_id", user.id)
      .single();
    
    if (sourceError || !source) {
      return new Response(
        JSON.stringify({ error: "Source not found or not authorized" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // For Shopify sources, get the credentials
    if (source.source_type !== "Shopify") {
      return new Response(
        JSON.stringify({ error: "Only Shopify sources are supported currently" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // Get Shopify credentials
    const credentialId = source.credentials.credential_id;
    const { data: shopifyCredentials, error: credentialsError } = await supabase
      .from("shopify_credentials")
      .select("*")
      .eq("id", credentialId)
      .eq("user_id", user.id)
      .single();
    
    if (credentialsError || !shopifyCredentials) {
      return new Response(
        JSON.stringify({ error: "Shopify credentials not found" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // Update extraction status to running if not just a preview
    if (!preview_only) {
      await supabase
        .from("extractions")
        .update({ 
          status: "running", 
          started_at: new Date().toISOString(),
          progress: 0,
          status_message: "Starting extraction..."
        })
        .eq("id", extraction_id);
    }
    
    let query = "";
    let variables = { first: limit };
    
    // Determine which query to use based on extraction type
    switch (extraction.extraction_type) {
      case "custom":
        query = extraction.custom_query || "";
        break;
      case "predefined":
        query = getPredefinedQuery(extraction.template_name);
        break;
      case "dependent":
        // For dependent queries, we'll need to implement more complex logic
        // This is a placeholder for future implementation
        query = getDependentQueryTemplate(extraction.template_name).primaryQuery;
        break;
      default:
        return new Response(
          JSON.stringify({ error: "Invalid extraction type" }),
          { 
            status: 400, 
            headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
          }
        );
    }
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "Failed to generate query" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
          }
      );
    }
    
    // Execute the query
    const apiVersion = "2023-10"; // Could be made configurable
    const endpoint = `https://${shopifyCredentials.store_name}.myshopify.com/admin/api/${apiVersion}/graphql.json`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopifyCredentials.api_token
      },
      body: JSON.stringify({ query, variables })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      
      // Update extraction status if not a preview
      if (!preview_only) {
        await supabase
          .from("extractions")
          .update({ 
            status: "failed", 
            status_message: `Shopify API error: ${response.status} ${errorText}`,
            completed_at: new Date().toISOString()
          })
          .eq("id", extraction_id);
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Shopify API error: ${response.status} ${response.statusText}`,
          details: errorText
        }),
        { 
          status: response.status, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    const data = await response.json();
    
    // Handle GraphQL errors
    if (data.errors && data.errors.length > 0) {
      // Update extraction status if not a preview
      if (!preview_only) {
        await supabase
          .from("extractions")
          .update({ 
            status: "failed", 
            status_message: `GraphQL error: ${data.errors[0].message}`,
            completed_at: new Date().toISOString()
          })
          .eq("id", extraction_id);
      }
      
      return new Response(
        JSON.stringify({ 
          error: "GraphQL error", 
          details: data.errors 
        }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // Extract results based on query type
    const results = extractResults(data.data);
    
    // For preview only, just return the results
    if (preview_only) {
      return new Response(
        JSON.stringify({ 
          results,
          count: results.length,
          preview: true
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // Update extraction with results
    await supabase
      .from("extractions")
      .update({ 
        status: "completed", 
        progress: 100,
        status_message: "Extraction completed successfully",
        result_data: results,
        record_count: results.length,
        completed_at: new Date().toISOString()
      })
      .eq("id", extraction_id);
    
    return new Response(
      JSON.stringify({ 
        results,
        count: results.length,
        extraction_id
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
      }
    );
  } catch (error) {
    console.error("Extraction error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
      }
    );
  }
});

// Helper function to get predefined query
function getPredefinedQuery(templateName: string): string {
  const templates: Record<string, string> = {
    "products_basic": `
      query GetProducts($first: Int!) {
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              description
              createdAt
              updatedAt
              productType
              vendor
              publishedAt
              tags
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `,
    "orders_basic": `
      query GetOrders($first: Int!) {
        orders(first: $first) {
          edges {
            node {
              id
              name
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              email
              phone
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                id
                email
                firstName
                lastName
              }
            }
          }
        }
      }
    `,
    "customers_basic": `
      query GetCustomers($first: Int!) {
        customers(first: $first) {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
              createdAt
              updatedAt
              tags
              ordersCount
              totalSpent {
                amount
                currencyCode
              }
            }
          }
        }
      }
    `,
    // Add more predefined templates as needed
  };
  
  return templates[templateName] || "";
}

// Helper function for dependent query templates
function getDependentQueryTemplate(templateName: string): any {
  const templates: Record<string, any> = {
    "customer_with_orders": {
      primaryQuery: `
        query GetCustomers($first: Int!, $after: String) {
          customers(first: $first, after: $after) {
            edges {
              node {
                id
                firstName
                lastName
                email
                phone
                createdAt
                tags
                ordersCount
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
      buildSecondaryQuery: (customerId: string) => {
        return {
          query: `
            query GetCustomerOrders($customerId: ID!, $first: Int!) {
              customer(id: $customerId) {
                orders(first: $first) {
                  edges {
                    node {
                      id
                      name
                      createdAt
                      totalPriceSet {
                        shopMoney {
                          amount
                          currencyCode
                        }
                      }
                      displayFinancialStatus
                      displayFulfillmentStatus
                    }
                  }
                }
              }
            }
          `,
          variables: {
            customerId,
            first: 10
          }
        };
      },
      idExtractor: (customers: any[]) => {
        return customers.map(customer => customer.id);
      },
      resultMerger: (customers: any[], orderData: any[]) => {
        // Create a map of customer ID to orders
        const ordersMap = new Map();
        
        orderData.forEach(data => {
          if (data.customer && data.customer.orders) {
            const customerId = data.customer.id;
            const orders = data.customer.orders.edges.map((edge: any) => edge.node);
            ordersMap.set(customerId, orders);
          }
        });
        
        // Merge customers with their orders
        return customers.map(customer => {
          return {
            ...customer,
            orders: ordersMap.get(customer.id) || []
          };
        });
      }
    },
    // Add more dependent query templates as needed
  };
  
  return templates[templateName] || { primaryQuery: "", buildSecondaryQuery: () => ({}), idExtractor: () => [], resultMerger: () => [] };
}

// Helper function to extract results from GraphQL response
function extractResults(data: any): any[] {
  if (!data) return [];
  
  // Find the first property that has an edges array
  for (const key in data) {
    if (data[key] && data[key].edges && Array.isArray(data[key].edges)) {
      return data[key].edges.map((edge: any) => edge.node);
    }
  }
  
  return [];
}
