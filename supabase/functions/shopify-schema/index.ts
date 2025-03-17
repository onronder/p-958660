import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeadersWithAuth = {
  ...corsHeaders,
  "Access-Control-Allow-Credentials": "true",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeadersWithAuth,
    });
  }

  try {
    const { source_id, api_version = "2023-10", test_only = false } = await req.json();

    if (!source_id) {
      return new Response(
        JSON.stringify({ error: "Missing source_id parameter" }),
        {
          status: 400,
          headers: { ...corsHeadersWithAuth, "Content-Type": "application/json" },
        }
      );
    }

    // Connect to Supabase
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const adminAuthClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get source details from the database
    const { data: source, error: sourceError } = await supabase
      .from("sources")
      .select("*")
      .eq("id", source_id)
      .single();

    if (sourceError) {
      console.error("Error fetching source:", sourceError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch source details", details: sourceError }),
        {
          status: 500,
          headers: { ...corsHeadersWithAuth, "Content-Type": "application/json" },
        }
      );
    }

    if (!source) {
      return new Response(
        JSON.stringify({ error: "Source not found" }),
        {
          status: 404,
          headers: { ...corsHeadersWithAuth, "Content-Type": "application/json" },
        }
      );
    }

    // Extract credentials from the source
    const credentials = source.credentials || {};
    const shopName = source.url.replace('.myshopify.com', '');
    
    // Choose the appropriate token based on the auth method
    const apiToken = credentials.api_token || credentials.access_token;

    if (!apiToken) {
      return new Response(
        JSON.stringify({ error: "No API token found in source credentials" }),
        {
          status: 400,
          headers: { ...corsHeadersWithAuth, "Content-Type": "application/json" },
        }
      );
    }

    // If this is just a connection test, send a simple query to test the API
    if (test_only) {
      const testQuery = `{
        shop {
          name
        }
      }`;

      const shopResponse = await executeShopifyQuery({
        shopName,
        apiToken,
        query: testQuery,
        apiVersion
      });

      if (shopResponse.error) {
        return new Response(
          JSON.stringify({ 
            error: "Failed to connect to Shopify GraphQL API", 
            details: shopResponse.details 
          }),
          {
            status: shopResponse.status || 500,
            headers: { ...corsHeadersWithAuth, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Successfully connected to Shopify GraphQL API",
          shop: shopResponse.data.shop
        }),
        {
          status: 200,
          headers: { ...corsHeadersWithAuth, "Content-Type": "application/json" },
        }
      );
    }

    // For full schema introspection
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          queryType { name }
          mutationType { name }
          subscriptionType { name }
          types {
            ...FullType
          }
          directives {
            name
            description
            locations
            args {
              ...InputValue
            }
          }
        }
      }

      fragment FullType on __Type {
        kind
        name
        description
        fields(includeDeprecated: true) {
          name
          description
          args {
            ...InputValue
          }
          type {
            ...TypeRef
          }
          isDeprecated
          deprecationReason
        }
        inputFields {
          ...InputValue
        }
        interfaces {
          ...TypeRef
        }
        enumValues(includeDeprecated: true) {
          name
          description
          isDeprecated
          deprecationReason
        }
        possibleTypes {
          ...TypeRef
        }
      }

      fragment InputValue on __InputValue {
        name
        description
        type {
          ...TypeRef
        }
        defaultValue
      }

      fragment TypeRef on __Type {
        kind
        name
        ofType {
          kind
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
                ofType {
                  kind
                  name
                  ofType {
                    kind
                    name
                    ofType {
                      kind
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const schemaResponse = await executeShopifyQuery({
      shopName,
      apiToken,
      query: introspectionQuery,
      apiVersion
    });

    if (schemaResponse.error) {
      return new Response(
        JSON.stringify({ 
          error: "Failed to fetch GraphQL schema", 
          details: schemaResponse.details 
        }),
        {
          status: schemaResponse.status || 500,
          headers: { ...corsHeadersWithAuth, "Content-Type": "application/json" },
        }
      );
    }

    // Process the schema to make it more usable
    const processedSchema = processSchema(schemaResponse.data.__schema);

    return new Response(
      JSON.stringify({ 
        success: true, 
        schema: processedSchema 
      }),
      {
        status: 200,
        headers: { ...corsHeadersWithAuth, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: `Internal server error: ${error.message}` }),
      {
        status: 500,
        headers: { ...corsHeadersWithAuth, "Content-Type": "application/json" },
      }
    );
  }
});

/**
 * Executes a GraphQL query against the Shopify API
 */
async function executeShopifyQuery({
  shopName,
  apiToken,
  query,
  variables,
  apiVersion
}) {
  try {
    const endpoint = `https://${shopName}.myshopify.com/admin/api/${apiVersion}/graphql.json`;
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": apiToken
      },
      body: JSON.stringify({ query, variables })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        error: `Shopify API error: ${response.status} ${response.statusText}`,
        details: errorText,
        status: response.status
      };
    }
    
    const data = await response.json();
    
    // Handle GraphQL errors
    if (data.errors && data.errors.length > 0) {
      return {
        error: "GraphQL error",
        details: data.errors,
        status: 400
      };
    }
    
    return { data: data.data };
  } catch (error) {
    return {
      error: `Error executing Shopify query: ${error.message}`,
      status: 500
    };
  }
}

/**
 * Process the raw GraphQL schema into a more usable format
 */
function processSchema(schema) {
  // Extract the main query type
  const queryTypeName = schema.queryType.name;
  const queryType = schema.types.find(type => type.name === queryTypeName);
  
  // Extract only the fields from the query type that are useful for data extraction
  // (excluding introspection fields that start with __)
  const extractableQueries = queryType.fields
    .filter(field => !field.name.startsWith('__'))
    .map(field => ({
      name: field.name,
      description: field.description,
      returnType: getTypeName(field.type),
      args: field.args.map(arg => ({
        name: arg.name,
        description: arg.description,
        type: getTypeName(arg.type),
        required: isNonNullType(arg.type)
      }))
    }));
  
  // Get all object types (excluding introspection types)
  const objectTypes = schema.types
    .filter(type => 
      type.kind === 'OBJECT' && 
      !type.name.startsWith('__') &&
      type.name !== queryTypeName
    )
    .map(type => ({
      name: type.name,
      description: type.description,
      fields: type.fields.map(field => ({
        name: field.name,
        description: field.description,
        type: getTypeName(field.type),
        args: field.args.length > 0 ? field.args.map(arg => ({
          name: arg.name,
          type: getTypeName(arg.type)
        })) : undefined
      }))
    }));
  
  return {
    queries: extractableQueries,
    types: objectTypes
  };
}

/**
 * Get the name of a type, handling nested types
 */
function getTypeName(type) {
  if (type.kind === 'NON_NULL') {
    return `${getTypeName(type.ofType)}!`;
  }
  if (type.kind === 'LIST') {
    return `[${getTypeName(type.ofType)}]`;
  }
  return type.name;
}

/**
 * Check if a type is non-null (required)
 */
function isNonNullType(type) {
  return type.kind === 'NON_NULL';
}
