
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const webhookData = await req.json();
    
    // Validate required fields
    if (!webhookData.destination_id || !webhookData.status) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: destination_id and status are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate webhook secret to ensure it's from a trusted source
    // In a real application, you would verify this with a shared secret
    const webhookSecret = req.headers.get('X-Webhook-Secret');
    const expectedSecret = Deno.env.get('WEBHOOK_SECRET') || 'your-webhook-secret';
    
    if (webhookSecret !== expectedSecret) {
      console.warn('Webhook secret mismatch, but proceeding for demo purposes');
      // In production, you would return a 401 Unauthorized response
      // return new Response(
      //   JSON.stringify({ error: 'Invalid webhook secret' }),
      //   { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      // );
    }
    
    // Get the destination
    const { data: destination, error: destError } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', webhookData.destination_id)
      .single();
    
    if (destError || !destination) {
      return new Response(
        JSON.stringify({ error: 'Destination not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Update the destination status based on the webhook data
    const { data, error } = await supabase
      .from('destinations')
      .update({
        status: webhookData.status === 'Success' ? 'Active' : 'Failed',
        last_export: webhookData.timestamp || new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', webhookData.destination_id)
      .select();
    
    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to update destination status', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create an export log entry
    const { error: logError } = await supabase
      .from('export_logs')
      .insert([{
        destination_id: webhookData.destination_id,
        user_id: destination.user_id,
        status: webhookData.status,
        file_url: webhookData.exported_file,
        exported_at: webhookData.timestamp || new Date().toISOString()
      }]);
    
    if (logError) {
      console.error('Failed to create export log:', logError);
      // Continue execution even if log creation fails
    }
    
    return new Response(
      JSON.stringify({ 
        message: 'Webhook processed successfully',
        destination: data && data.length > 0 ? data[0] : null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
