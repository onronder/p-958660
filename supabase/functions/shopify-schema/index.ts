
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders, getProductionCorsHeaders } from "../_shared/cors.ts";

serve(async (req: Request) => {
  // Handle CORS preflight requests
  const requestOrigin = req.headers.get("origin");
  const responseCorsHeaders = getProductionCorsHeaders(requestOrigin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: responseCorsHeaders });
  }

  try {
    const { source_id, api_version } = await req.json();
    
    if (!source_id || !api_version) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: source_id or api_version" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }

    // Create a Supabase client with the Supabase URL and service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user ID from JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { 
          status: 401, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { 
          status: 401, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }

    // Check if we already have a cached schema for this source and API version
    const { data: existingSchema, error: schemaError } = await supabase
      .from("schema_cache")
      .select("*")
      .eq("source_id", source_id)
      .eq("api_version", api_version)
      .single();
    
    // If we have a recent cache (less than 24 hours old), return it
    if (existingSchema && !schemaError) {
      const cacheAge = new Date().getTime() - new Date(existingSchema.cached_at).getTime();
      const oneDayMs = 24 * 60 * 60 * 1000;
      
      if (cacheAge < oneDayMs) {
        return new Response(
          JSON.stringify({ schema: existingSchema.schema, cached_at: existingSchema.cached_at, from_cache: true }),
          { 
            status: 200, 
            headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
          }
        );
      }
    }
    
    // Get the source details to retrieve Shopify credentials
    const { data: source, error: sourceError } = await supabase
      .from("sources")
      .select("*")
      .eq("id", source_id)
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
        JSON.stringify({ error: "Only Shopify sources are supported for schema retrieval" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }

    // Get Shopify credentials
    const { data: shopifyCredentials, error: credentialsError } = await supabase
      .from("shopify_credentials")
      .select("*")
      .eq("id", source.credentials.credential_id)
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

    // Create introspection query
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          types {
            name
            description
            kind
            fields {
              name
              description
              type {
                name
                kind
                ofType {
                  name
                  kind
                  ofType {
                    name
                    kind
                  }
                }
              }
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
            }
          }
        }
      }
    `;
    
    // Execute GraphQL introspection query against Shopify
    const endpoint = `https://${shopifyCredentials.store_name}.myshopify.com/admin/api/${api_version}/graphql.json`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": shopifyCredentials.api_token
      },
      body: JSON.stringify({ query: introspectionQuery })
    });
    
    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Shopify API error: ${response.status} ${response.statusText}` }),
        { 
          status: response.status, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    const schemaData = await response.json();
    
    // Process schema for better UX
    const processedSchema = processSchema(schemaData);
    
    // Cache the schema
    const { data: cachedSchema, error: cacheError } = await supabase
      .from("schema_cache")
      .upsert({
        source_id,
        api_version,
        schema: processedSchema,
        cached_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (cacheError) {
      console.error("Error caching schema:", cacheError);
    }
    
    return new Response(
      JSON.stringify({ 
        schema: processedSchema, 
        cached_at: new Date().toISOString(),
        from_cache: false 
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
      }
    );
  } catch (error) {
    console.error("Schema caching error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
      }
    );
  }
});

// Helper function to organize schema into categories
function processSchema(schemaData: any) {
  if (!schemaData.data || !schemaData.data.__schema) {
    throw new Error("Invalid schema data");
  }
  
  const types = schemaData.data.__schema.types;
  
  // Filter out internal GraphQL types
  const filteredTypes = types.filter((type: any) => {
    return (
      type.name && 
      !type.name.startsWith("__") && 
      type.fields &&
      (type.kind === "OBJECT" || type.kind === "INTERFACE")
    );
  });
  
  // Create categories
  const categories: Record<string, any[]> = {
    Products: [],
    Customers: [],
    Orders: [],
    Collections: [],
    Inventory: [],
    Other: []
  };
  
  // Sort types into categories based on name
  filteredTypes.forEach((type: any) => {
    if (type.name.includes("Product")) {
      categories.Products.push(type);
    } else if (type.name.includes("Customer")) {
      categories.Customers.push(type);
    } else if (type.name.includes("Order")) {
      categories.Orders.push(type);
    } else if (type.name.includes("Collection")) {
      categories.Collections.push(type);
    } else if (type.name.includes("Inventory")) {
      categories.Inventory.push(type);
    } else {
      categories.Other.push(type);
    }
  });
  
  return {
    categories,
    allTypes: filteredTypes,
    rawSchema: schemaData
  };
}
