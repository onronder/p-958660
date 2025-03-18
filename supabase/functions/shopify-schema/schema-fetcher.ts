
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

/**
 * Fetches the GraphQL schema from Shopify
 * @param storeUrl Formatted Shopify store URL
 * @param accessToken Shopify access token
 * @param apiVersion Detected API version
 * @param sourceId Source ID for caching
 * @param supabase Supabase client instance
 * @returns Response with schema data or error
 */
export async function fetchShopifySchema(
  storeUrl: string,
  accessToken: string,
  apiVersion: string,
  sourceId: string,
  supabase: any
): Promise<Response> {
  try {
    console.log("Fetching fresh schema from Shopify using API version:", apiVersion);
    
    // Introspection query to get the full schema
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          queryType {
            name
            fields {
              name
              description
              args {
                name
                description
                type {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
          }
          types {
            name
            kind
            description
            fields {
              name
              description
              args {
                name
                description
                type {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
            inputFields {
              name
              description
              type {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
            interfaces {
              name
            }
            enumValues {
              name
              description
            }
            possibleTypes {
              name
            }
          }
        }
      }
    `;
    
    const response = await fetch(`https://${storeUrl}/admin/api/${apiVersion}/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken
      },
      body: JSON.stringify({ query: introspectionQuery })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Shopify API error during schema fetch:", response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch Shopify GraphQL schema", 
          details: errorText 
        }),
        { 
          status: 422, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const schemaData = await response.json();
    
    if (!schemaData.data) {
      throw new Error("Invalid schema data received from Shopify");
    }
    
    // Store the schema in our cache
    const now = new Date().toISOString();
    const { error: upsertError } = await supabase
      .from("schema_cache")
      .upsert({
        source_id: sourceId,
        schema: schemaData.data,
        api_version: apiVersion,
        cached_at: now
      });
    
    if (upsertError) {
      console.error("Error caching schema:", upsertError);
    } else {
      console.log("Schema cached successfully at", now, "with API version:", apiVersion);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        schema: schemaData.data, 
        message: "Successfully fetched and cached Shopify GraphQL schema",
        is_cached: false,
        cached_at: now,
        api_version: apiVersion
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error fetching Shopify schema:", error);
    
    return new Response(
      JSON.stringify({ error: `Error fetching schema: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}
