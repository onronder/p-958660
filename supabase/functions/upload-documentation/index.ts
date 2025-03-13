
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";
import { getProductionCorsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Get appropriate CORS headers based on request origin
  const requestOrigin = req.headers.get("origin");
  const corsHeaders = getProductionCorsHeaders(requestOrigin);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Check if request is multipart/form-data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(
        JSON.stringify({ error: "Missing file" }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Parse the file
    const text = await file.text();
    const article = JSON.parse(text);

    if (!article.category || !article.title || !article.slug || !article.content) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Insert article into the database
    const { data: articleData, error: articleError } = await supabaseClient
      .from('help_articles')
      .insert([{
        category: article.category,
        title: article.title,
        slug: article.slug,
        content: article.content
      }])
      .select();

    if (articleError) {
      console.error("Error inserting article:", articleError);
      return new Response(
        JSON.stringify({ error: articleError.message }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, article: articleData[0] }),
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Error processing upload:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
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
