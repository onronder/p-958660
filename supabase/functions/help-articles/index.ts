
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Parse URL to get query parameters for GET requests
    let query = '';
    let category = '';
    
    // Extract query parameters from request based on HTTP method
    if (req.method === 'GET') {
      const url = new URL(req.url);
      query = url.searchParams.get('query') || '';
      category = url.searchParams.get('category') || '';
    } else {
      // For non-GET requests, parse the body
      try {
        const requestData = await req.json();
        query = requestData.query || '';
        category = requestData.category || '';
      } catch (e) {
        console.error("Failed to parse request body:", e);
      }
    }

    console.log(`Processing request with query: "${query}", category: "${category}"`);

    // GET request for fetching articles
    if (req.method === 'GET') {
      let articlesQuery = supabaseClient
        .from('help_articles')
        .select('*');

      // Apply search filter if query parameter is provided
      if (query) {
        articlesQuery = articlesQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
        
        // Log search if user is authenticated
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user) {
          await supabaseClient
            .from('help_search_logs')
            .insert({
              user_id: user.id,
              query: query,
            });
        }
      }

      // Apply category filter if provided
      if (category && category !== 'All Categories') {
        articlesQuery = articlesQuery.eq('category', category);
      }

      const { data: articles, error } = await articlesQuery;

      if (error) {
        console.error('Error fetching articles:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { 
            status: 400, 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders 
            } 
          }
        );
      }

      return new Response(
        JSON.stringify({ articles }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});
