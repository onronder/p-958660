
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.2";
import { corsHeaders, getCategories, getFilteredArticles, handleError } from './handlers.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Return all categories
    if (url.pathname.endsWith('/categories')) {
      return getCategories();
    }

    // Return filtered articles
    return getFilteredArticles(url.searchParams);
  } catch (error) {
    return handleError(error);
  }
});
