
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase URLs and keys from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { source_id, test_only = false, force_refresh = false } = await req.json();
    
    if (!source_id) {
      return new Response(
        JSON.stringify({ error: "Source ID is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log("Processing request for source_id:", source_id, "test_only:", test_only, "force_refresh:", force_refresh);

    // Get source details from database
    const { data: source, error: sourceError } = await supabase
      .from('sources')
      .select('*')
      .eq('id', source_id)
      .single();
    
    if (sourceError || !source) {
      console.error("Error fetching source:", sourceError);
      return new Response(
        JSON.stringify({ error: "Source not found or could not be retrieved" }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log("Source retrieved:", source.name, "Type:", source.source_type);

    // Check if source is of type Shopify
    if (source.source_type !== 'Shopify') {
      return new Response(
        JSON.stringify({ error: "Source is not a Shopify store" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract credentials
    const credentials = source.credentials || {};
    const accessToken = credentials.api_token || credentials.access_token;
    const storeUrl = source.url;
    
    if (!storeUrl || !accessToken) {
      return new Response(
        JSON.stringify({ error: "Missing Shopify store URL or access token" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Ensure store URL has proper format
    const formattedStoreUrl = storeUrl.includes(".myshopify.com") 
      ? storeUrl.replace(/^https?:\/\//, '') 
      : `${storeUrl}.myshopify.com`;

    // For test_only, we just verify if we can connect to Shopify's GraphQL API
    if (test_only) {
      console.log("Testing connection to:", formattedStoreUrl);
      
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
        const response = await fetch(`https://${formattedStoreUrl}/admin/api/2023-10/graphql.json`, {
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
          JSON.stringify({ success: true, message: "Successfully connected to Shopify GraphQL API" }),
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
    
    // If not just testing, check if we need to fetch a new schema
    if (!force_refresh) {
      // Check if we have a recent cache (less than 4 hours old)
      const { data: cachedSchema, error: cacheError } = await supabase
        .from("schema_cache")
        .select("schema, cached_at")
        .eq("source_id", source_id)
        .order("cached_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (cachedSchema && !cacheError) {
        const cacheAge = Date.now() - new Date(cachedSchema.cached_at).getTime();
        const cacheAgeHours = cacheAge / (1000 * 60 * 60);
        
        // Use cached schema if it's less than 4 hours old
        if (cacheAgeHours < 4) {
          console.log("Using cached schema, age:", cacheAgeHours.toFixed(2), "hours");
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              schema: cachedSchema.schema, 
              message: "Using cached schema",
              is_cached: true,
              cached_at: cachedSchema.cached_at
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }
    }
    
    // Fetch new schema from Shopify
    try {
      console.log("Fetching fresh schema from Shopify");
      
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
      
      const response = await fetch(`https://${formattedStoreUrl}/admin/api/2023-10/graphql.json`, {
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
          source_id,
          schema: schemaData.data,
          api_version: "2023-10",
          cached_at: now
        });
      
      if (upsertError) {
        console.error("Error caching schema:", upsertError);
      } else {
        console.log("Schema cached successfully at", now);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          schema: schemaData.data, 
          message: "Successfully fetched and cached Shopify GraphQL schema",
          is_cached: false,
          cached_at: now
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
  } catch (error) {
    console.error("Unexpected error in shopify-schema function:", error);
    
    return new Response(
      JSON.stringify({ error: `Unexpected error: ${error.message}` }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
