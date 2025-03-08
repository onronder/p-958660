
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get the JWT token from the authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token or user not found' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { tokenId } = await req.json();
    
    if (!tokenId) {
      return new Response(
        JSON.stringify({ error: 'Missing token ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the token data from the database
    const { data: tokenData, error: tokenError } = await supabase
      .from('storage_tokens')
      .select('*')
      .eq('id', tokenId)
      .eq('user_id', user.id)
      .single();
    
    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Token not found or unauthorized' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Make sure we have a refresh token
    if (!tokenData.refresh_token) {
      return new Response(
        JSON.stringify({ error: 'No refresh token available' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Configure OAuth based on provider
    const tokenUrl = tokenData.provider === 'google_drive'
      ? 'https://oauth2.googleapis.com/token'
      : 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
      
    const clientId = tokenData.provider === 'google_drive'
      ? Deno.env.get('GOOGLE_CLIENT_ID')
      : Deno.env.get('MICROSOFT_CLIENT_ID');
      
    const clientSecret = tokenData.provider === 'google_drive'
      ? Deno.env.get('GOOGLE_CLIENT_SECRET')
      : Deno.env.get('MICROSOFT_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      console.error(`Missing ${tokenData.provider} credentials`);
      return new Response(
        JSON.stringify({ error: 'OAuth provider not properly configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange refresh token for new access token
    const formData = new URLSearchParams();
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);
    formData.append('refresh_token', tokenData.refresh_token);
    formData.append('grant_type', 'refresh_token');

    console.log(`Refreshing token from ${tokenUrl}`);
    const refreshResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!refreshResponse.ok) {
      const errorData = await refreshResponse.text();
      console.error('Token refresh failed:', errorData);
      
      // Log the failed refresh
      await supabase
        .from('destination_logs')
        .insert({
          user_id: user.id,
          event_type: 'oauth_token_refresh_failed',
          message: `Failed to refresh token for ${tokenData.provider}`,
          details: { error: errorData }
        });
        
      return new Response(
        JSON.stringify({ error: 'Failed to refresh token', details: errorData }),
        { status: refreshResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const refreshData = await refreshResponse.json();
    
    // Update the token in the storage_tokens table
    const newRefreshToken = refreshData.refresh_token || tokenData.refresh_token;
    const { error: updateError } = await supabase
      .from('storage_tokens')
      .update({
        access_token: refreshData.access_token,
        refresh_token: newRefreshToken,
        expires_at: refreshData.expires_in ? 
          new Date(Date.now() + refreshData.expires_in * 1000).toISOString() : 
          null
      })
      .eq('id', tokenId);
    
    if (updateError) {
      console.error('Failed to update token:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Log the successful token refresh
    await supabase
      .from('destination_logs')
      .insert({
        user_id: user.id,
        event_type: 'oauth_token_refresh',
        message: `Successfully refreshed ${tokenData.provider} token`,
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        provider: tokenData.provider,
        expires_in: refreshData.expires_in || null
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error refreshing OAuth token:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
