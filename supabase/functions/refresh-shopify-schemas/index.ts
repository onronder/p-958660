
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { getProductionCorsHeaders } from '../_shared/cors.ts';

/**
 * Refresh Shopify Schemas Edge Function
 * 
 * This function is designed to be run on a schedule (weekly) to ensure all 
 * Shopify schemas are kept up to date with the latest API versions.
 */
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: getProductionCorsHeaders(req.headers.get('origin'))
    });
  }

  try {
    // Get Supabase URLs and keys from environment
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Optional: Parse the request body for any configuration options
    let config = { forceAll: false };
    
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body && typeof body === 'object') {
          config = { ...config, ...body };
        }
      } catch (e) {
        // Ignore parsing errors, use defaults
      }
    }
    
    console.log("Starting automated Shopify schema refresh job");
    console.log("Configuration:", config);
    
    // Get all active Shopify sources
    const { data: sources, error: sourcesError } = await supabase
      .from('sources')
      .select('id, name, url, credentials')
      .eq('source_type', 'Shopify')
      .eq('is_deleted', false);
    
    if (sourcesError) {
      throw new Error(`Error fetching Shopify sources: ${sourcesError.message}`);
    }
    
    console.log(`Found ${sources?.length || 0} active Shopify sources`);
    
    // Process each source
    const results = {
      total: sources?.length || 0,
      processed: 0,
      succeeded: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
    
    // If there are no sources, return early
    if (!sources || sources.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No Shopify sources to process",
          results
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...getProductionCorsHeaders(req.headers.get('origin'))
          }
        }
      );
    }
    
    // Check if we need to refresh all sources or just outdated ones
    if (!config.forceAll) {
      console.log("Checking for outdated schemas (older than 7 days)");
      
      // Get cached schemas with their timestamps
      const { data: cachedSchemas } = await supabase
        .from('schema_cache')
        .select('source_id, cached_at')
        .in('source_id', sources.map(s => s.id));
      
      // Create a map of source IDs to cached dates
      const cacheMap = new Map();
      
      if (cachedSchemas) {
        cachedSchemas.forEach(cache => {
          cacheMap.set(cache.source_id, new Date(cache.cached_at));
        });
      }
      
      // Define timestamp for 7 days ago
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      // Filter sources to just those that need refreshing
      const sourcesToRefresh = sources.filter(source => {
        // If no cache exists or cache is older than 7 days, refresh
        const cacheDate = cacheMap.get(source.id);
        if (!cacheDate || cacheDate < sevenDaysAgo) {
          return true;
        }
        
        // Skip this source as it has a recent cache
        results.skipped++;
        results.details.push({
          source_id: source.id,
          name: source.name,
          status: 'skipped',
          reason: 'Recent cache exists'
        });
        
        return false;
      });
      
      console.log(`Filtered down to ${sourcesToRefresh.length} sources that need refreshing`);
      
      // If all sources are up to date, return early
      if (sourcesToRefresh.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "All schemas are up to date",
            results
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...getProductionCorsHeaders(req.headers.get('origin'))
            }
          }
        );
      }
    }
    
    // Process each source in sequence to refresh its schema
    for (const source of sources) {
      try {
        results.processed++;
        console.log(`Processing source: ${source.name} (${source.id})`);
        
        // Skip sources without credentials
        if (!source.credentials || typeof source.credentials !== 'object') {
          console.log(`Skipping source ${source.id} - missing credentials`);
          results.skipped++;
          results.details.push({
            source_id: source.id,
            name: source.name,
            status: 'skipped',
            reason: 'Missing credentials'
          });
          continue;
        }
        
        // Extract credentials
        const accessToken = source.credentials.access_token;
        let storeUrl = source.url;
        
        if (!accessToken || !storeUrl) {
          console.log(`Skipping source ${source.id} - missing access token or store URL`);
          results.skipped++;
          results.details.push({
            source_id: source.id,
            name: source.name,
            status: 'skipped',
            reason: 'Missing access token or store URL'
          });
          continue;
        }
        
        // Ensure store URL has proper format
        if (!storeUrl.includes(".myshopify.com")) {
          storeUrl = `${storeUrl}.myshopify.com`;
        }
        storeUrl = storeUrl.replace(/^https?:\/\//, '');
        
        // Call the shopify-schema endpoint to refresh the schema for this source
        // We use fetch instead of supabase functions invoke to ensure we get proper error handling
        const schemaResponse = await fetch(`${supabaseUrl}/functions/v1/shopify-schema`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`
          },
          body: JSON.stringify({
            source_id: source.id,
            force_refresh: true
          })
        });
        
        if (!schemaResponse.ok) {
          const errorText = await schemaResponse.text();
          throw new Error(`Schema refresh failed (${schemaResponse.status}): ${errorText}`);
        }
        
        const schemaResult = await schemaResponse.json();
        
        console.log(`✅ Successfully refreshed schema for ${source.name} (API v${schemaResult.api_version})`);
        results.succeeded++;
        results.details.push({
          source_id: source.id,
          name: source.name,
          status: 'success',
          api_version: schemaResult.api_version,
          timestamp: schemaResult.cached_at
        });
        
      } catch (error) {
        console.error(`❌ Error refreshing schema for source ${source.id}:`, error);
        results.failed++;
        results.details.push({
          source_id: source.id,
          name: source.name,
          status: 'failed',
          error: error.message
        });
      }
      
      // Small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log("Completed Shopify schema refresh job");
    console.log("Results:", {
      total: results.total,
      processed: results.processed,
      succeeded: results.succeeded,
      failed: results.failed,
      skipped: results.skipped
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Completed Shopify schema refresh. Processed: ${results.processed}, Succeeded: ${results.succeeded}, Failed: ${results.failed}, Skipped: ${results.skipped}`,
        results
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...getProductionCorsHeaders(req.headers.get('origin'))
        }
      }
    );
    
  } catch (error) {
    console.error("Unexpected error in refresh-shopify-schemas function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `Unexpected error: ${error.message}` 
      }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...getProductionCorsHeaders(req.headers.get('origin'))
        } 
      }
    );
  }
});
