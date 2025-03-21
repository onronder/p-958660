
import { getProductionCorsHeaders } from "../_shared/cors.ts";

// Constants for cache management
const CACHE_MAX_AGE_DAYS = 7; // 7 days cache expiration
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Fetches the GraphQL schema from Shopify
 * @param storeUrl Formatted Shopify store URL
 * @param accessToken Shopify access token
 * @param apiVersion Detected API version
 * @param sourceId Source ID for caching
 * @param supabase Supabase client instance
 * @param forceRefresh Force a refresh of the schema even if cached
 * @returns Response with schema data or error
 */
export async function fetchShopifySchema(
  storeUrl: string,
  accessToken: string,
  apiVersion: string,
  sourceId: string,
  supabase: any,
  forceRefresh = false
): Promise<Response> {
  try {
    // If not forcing a refresh, check the cache first
    if (!forceRefresh) {
      console.log("Checking schema cache for source ID:", sourceId);
      
      const { data: cachedSchema, error: cacheError } = await supabase
        .from("schema_cache")
        .select("schema, cached_at, api_version")
        .eq("source_id", sourceId)
        .order("cached_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (cacheError) {
        console.warn("Error checking schema cache:", cacheError);
      } else if (cachedSchema) {
        const cacheDate = new Date(cachedSchema.cached_at);
        const now = new Date();
        const cacheAgeMs = now.getTime() - cacheDate.getTime();
        const cacheAgeDays = cacheAgeMs / MS_PER_DAY;
        
        console.log(`Found cached schema from ${cacheDate.toISOString()} using API version ${cachedSchema.api_version}`);
        console.log(`Cache age: ${cacheAgeDays.toFixed(2)} days (max age: ${CACHE_MAX_AGE_DAYS} days)`);
        
        // If cache is less than max age and the API version matches the current one, use it
        if (cacheAgeDays < CACHE_MAX_AGE_DAYS && cachedSchema.api_version === apiVersion) {
          console.log("✅ Using cached schema (still valid)");
          
          return new Response(
            JSON.stringify({
              success: true,
              schema: cachedSchema.schema,
              message: "Successfully retrieved cached Shopify GraphQL schema",
              is_cached: true,
              cached_at: cachedSchema.cached_at,
              api_version: cachedSchema.api_version
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                ...getProductionCorsHeaders(null)
              }
            }
          );
        }
        
        // Log reason for not using cache
        if (cacheAgeDays >= CACHE_MAX_AGE_DAYS) {
          console.log(`⚠️ Cached schema is too old (${cacheAgeDays.toFixed(2)} days), fetching fresh schema`);
        } 
        if (cachedSchema.api_version !== apiVersion) {
          console.log(`⚠️ Cached schema API version (${cachedSchema.api_version}) does not match current API version (${apiVersion}), fetching fresh schema`);
        }
      } else {
        console.log("No cached schema found, will fetch from Shopify");
      }
    } else {
      console.log("Force refresh requested, bypassing cache");
    }
    
    // Fetch fresh schema from Shopify
    console.log(`Fetching fresh schema from Shopify using API version: ${apiVersion}`);
    
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
      console.error("❌ Shopify API error during schema fetch:", response.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch Shopify GraphQL schema", 
          details: errorText 
        }),
        { 
          status: 422, 
          headers: { 
            'Content-Type': 'application/json',
            ...getProductionCorsHeaders(null)
          } 
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
      console.error("⚠️ Error caching schema:", upsertError);
    } else {
      console.log("✅ Schema cached successfully at", now, "with API version:", apiVersion);
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
        headers: { 
          'Content-Type': 'application/json',
          ...getProductionCorsHeaders(null)
        } 
      }
    );
  } catch (error) {
    console.error("❌ Error fetching Shopify schema:", error);
    
    return new Response(
      JSON.stringify({ error: `Error fetching schema: ${error.message}` }),
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
