
export async function handleExtraction(requestData, supabase, corsHeaders) {
  try {
    const { 
      user, 
      extraction_id, 
      source_id, 
      custom_query, 
      template_key,
      preview_only = false, 
      limit = 250 
    } = requestData;
    
    console.log("Processing extraction request for source:", source_id);
    
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
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    // For Shopify sources, get the credentials
    if (source.source_type !== "Shopify") {
      return new Response(
        JSON.stringify({ error: "Only Shopify sources are supported currently" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    // Get Shopify credentials
    if (!source.credentials || !source.credentials.credential_id) {
      console.error("Missing credential_id in source credentials:", source.credentials);
      return new Response(
        JSON.stringify({ error: "Source credentials are missing or invalid" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    const credentialId = source.credentials.credential_id;
    console.log("Fetching credentials with ID:", credentialId);
    
    const { data: shopifyCredentials, error: credentialsError } = await supabase
      .from("shopify_credentials")
      .select("*")
      .eq("id", credentialId)
      .single();
    
    if (credentialsError || !shopifyCredentials) {
      console.error("Credentials error:", credentialsError);
      return new Response(
        JSON.stringify({ error: "Shopify credentials not found" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    // Update extraction status to running if not just a preview
    if (!preview_only && extraction_id) {
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
    
    // Extract all available credentials
    const clientId = shopifyCredentials.client_id || shopifyCredentials.api_key;
    const clientSecret = shopifyCredentials.client_secret || shopifyCredentials.api_secret;
    const apiToken = shopifyCredentials.api_token || shopifyCredentials.access_token;
    
    // Log available credentials (safely, without exposing actual values)
    console.log("Using credentials:", {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      hasApiToken: !!apiToken,
      storeName: shopifyCredentials.store_name
    });
    
    // Determine which query to use
    let query = custom_query || "";
    const apiVersion = "2023-10"; // Could be made configurable
    
    if (!query && template_key) {
      // For predefined queries, we'd need to get the query from templates
      // Implementation needed based on your template system
      console.log("Using template key:", template_key);
      // query = getQueryFromTemplate(template_key);
    }
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: "No query provided and failed to generate query from template" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    // Set variables with appropriate limit based on whether this is a preview
    const variables = { first: preview_only ? Math.min(limit, 10) : limit };
    
    // Execute Shopify GraphQL query with all available credentials
    const { executeShopifyQuery } = await import("./shopify-api.ts");
    const result = await executeShopifyQuery({
      shopName: shopifyCredentials.store_name,
      apiToken,
      clientId,
      clientSecret,
      query,
      variables,
      apiVersion
    });
    
    if (result.error) {
      // Update extraction status if not a preview
      if (!preview_only && extraction_id) {
        await supabase
          .from("extractions")
          .update({ 
            status: "failed", 
            status_message: `Shopify API error: ${result.error}`,
            completed_at: new Date().toISOString()
          })
          .eq("id", extraction_id);
      }
      
      return new Response(
        JSON.stringify({ 
          error: result.error,
          details: result.details
        }),
        { 
          status: result.status || 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    if (!result.data) {
      return new Response(
        JSON.stringify({ error: "No data returned from Shopify API" }),
        { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    // Extract results
    const { extractResults } = await import("./extraction-utils.ts");
    const results = extractResults(result.data);
    console.log("Successfully extracted results:", results.length);
    
    // Generate a formatted sample for display
    const sample = results.length > 0 
      ? JSON.stringify(results.slice(0, Math.min(3, results.length)), null, 2)
      : null;
    
    // For preview only, just return the results
    if (preview_only) {
      return new Response(
        JSON.stringify({ 
          results,
          count: results.length,
          preview: true,
          sample
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }
    
    // Update extraction with results for complete extraction
    if (extraction_id) {
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
    }
    
    return new Response(
      JSON.stringify({ 
        results,
        count: results.length,
        extraction_id,
        sample
      }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error) {
    console.error("Extraction error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
}
