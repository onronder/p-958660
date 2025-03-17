
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
    const { source_id, api_version = "2023-10" } = await req.json();
    
    if (!source_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: source_id" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    console.log("Fetching schema for source ID:", source_id);
    
    // Get source details
    const { data: source, error: sourceError } = await supabase
      .from("sources")
      .select("*")
      .eq("id", source_id)
      .eq("user_id", user.id)
      .single();
    
    if (sourceError || !source) {
      console.error("Source error:", sourceError);
      return new Response(
        JSON.stringify({ error: "Source not found or not authorized" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // Only handle Shopify sources for now
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
    console.log("Fetching credentials with ID:", credentialId);
    
    const { data: shopifyCredentials, error: credentialsError } = await supabase
      .from("shopify_credentials")
      .select("*")
      .eq("id", credentialId)
      .eq("user_id", user.id)
      .single();
    
    if (credentialsError || !shopifyCredentials) {
      console.error("Credentials error:", credentialsError);
      return new Response(
        JSON.stringify({ error: "Shopify credentials not found" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    console.log("Executing introspection query to Shopify store:", shopifyCredentials.store_name);
    
    // Execute GraphQL introspection query
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
        type { ...TypeRef }
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
      const errorText = await response.text();
      console.error("Shopify API error:", response.status, errorText);
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
      console.error("GraphQL errors:", data.errors);
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
    
    console.log("Schema loaded successfully");
    
    return new Response(
      JSON.stringify({ 
        schema: data.data.__schema,
        api_version
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
      }
    );
  } catch (error) {
    console.error("Schema loading error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
      }
    );
  }
});
