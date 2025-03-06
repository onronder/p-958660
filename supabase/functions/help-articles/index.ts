
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

    // Parse the request body to get the parameters
    const requestData = await req.json();
    const query = requestData.query || '';
    const category = requestData.category || '';

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
