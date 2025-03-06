
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Parse form data
    const formData = await req.formData();
    const file = formData.get("file");
    const articleId = formData.get("article_id");

    if (!file || !articleId) {
      return new Response(
        JSON.stringify({ error: "Missing file or article ID" }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Ensure file is a blob
    if (!(file instanceof Blob)) {
      return new Response(
        JSON.stringify({ error: "File must be a valid file object" }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    const fileName = formData.get("file_name") as string || "image";
    const fileExt = (fileName.split('.').pop() || "png").toLowerCase();
    const filePath = `help_articles/${articleId}/${crypto.randomUUID()}.${fileExt}`;
    const fileBuffer = await file.arrayBuffer();

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('help_images')
      .upload(filePath, fileBuffer, {
        contentType: file.type || 'image/png',
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return new Response(
        JSON.stringify({ error: uploadError.message }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabaseClient.storage
      .from('help_images')
      .getPublicUrl(filePath);

    // Store image record in help_images table
    const { data: imageRecord, error: imageRecordError } = await supabaseClient
      .from('help_images')
      .insert({
        article_id: articleId,
        file_path: filePath
      })
      .select();

    if (imageRecordError) {
      console.error("Error creating image record:", imageRecordError);
      return new Response(
        JSON.stringify({ error: imageRecordError.message }),
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
      JSON.stringify({ 
        success: true, 
        filePath,
        publicUrl: publicUrlData.publicUrl,
        imageRecord: imageRecord[0]
      }),
      { 
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Error uploading image:", error);
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
