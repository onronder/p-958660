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
      console.error('User validation error:', userError);
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

    const requestBody = await req.json();
    console.log("Received OAuth callback request:", {
      method: req.method,
      provider: requestBody.provider,
      hasCode: !!requestBody.code,
      redirectUri: requestBody.redirectUri
    });
    
    const { provider, code, redirectUri } = requestBody;
    
    if (!provider || !code || !redirectUri) {
      console.error('Missing required parameters:', { provider, hasCode: !!code, redirectUri });
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing OAuth callback for ${provider} with redirect URI: ${redirectUri}`);

    // Configure OAuth based on provider
    const tokenUrl = provider === 'google_drive'
      ? 'https://oauth2.googleapis.com/token'
      : 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
      
    const clientId = provider === 'google_drive'
      ? Deno.env.get('GOOGLE_CLIENT_ID')
      : Deno.env.get('MICROSOFT_CLIENT_ID');
      
    const clientSecret = provider === 'google_drive'
      ? Deno.env.get('GOOGLE_CLIENT_SECRET')
      : Deno.env.get('MICROSOFT_CLIENT_SECRET');
    
    console.log(`OAuth provider config:`, {
      tokenUrl,
      clientId: clientId ? "present" : "missing",
      clientSecret: clientSecret ? "present" : "missing"
    });
    
    if (!clientId || !clientSecret) {
      console.error(`Missing ${provider} credentials`);
      return new Response(
        JSON.stringify({ error: 'OAuth provider not properly configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange code for tokens
    const formData = new URLSearchParams();
    formData.append('code', code);
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);
    formData.append('redirect_uri', redirectUri);
    formData.append('grant_type', 'authorization_code');
    
    // For OneDrive, we need additional scope information
    if (provider === 'onedrive') {
      formData.append('scope', 'files.readwrite.all offline_access');
    }

    console.log(`Requesting token from ${tokenUrl} with redirect URI: ${redirectUri}`);
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange failed - Response status:', tokenResponse.status);
      console.error('Token exchange failed - Error:', errorData);
      console.error('Token exchange failed - Request data:', {
        code: code ? "present" : "missing",
        client_id: clientId ? "present" : "missing", 
        redirect_uri: redirectUri
      });
      
      return new Response(
        JSON.stringify({ error: 'Failed to exchange code for token', details: errorData }),
        { status: tokenResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful:', {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresIn: tokenData.expires_in
    });
    
    try {
      // Check if storage_tokens table exists, and create it if it doesn't
      const tableExists = await checkTableExists(supabase, 'storage_tokens');
      
      if (!tableExists) {
        console.log('Creating storage_tokens table...');
        await createStorageTokensTable(supabase);
      }
      
      // Insert or update token in the storage_tokens table
      const { data: tokenRecord, error: tokenError } = await supabase
        .from('storage_tokens')
        .upsert({
          user_id: user.id,
          provider,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          expires_at: tokenData.expires_in ? 
            new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : 
            null,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, provider' })
        .select();
        
      if (tokenError) {
        console.error('Failed to store token:', tokenError);
        throw new Error(`Failed to store token: ${tokenError.message}`);
      }
      
      // Log the successful token exchange
      try {
        await logEvent(supabase, user.id, 'oauth_token_exchange', `Successfully exchanged OAuth code for ${provider} token`);
      } catch (logError) {
        console.error('Failed to log event (non-critical):', logError);
        // Don't fail the overall operation if just the logging fails
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          provider,
          expires_in: tokenData.expires_in || null,
          token_id: tokenRecord && tokenRecord.length > 0 ? tokenRecord[0]?.id : null
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      
      // Return a more detailed error message
      return new Response(
        JSON.stringify({ 
          error: 'Failed to store token', 
          details: dbError instanceof Error ? dbError.message : 'Unknown database error' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error processing OAuth callback:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to check if a table exists
async function checkTableExists(supabase, tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);
      
    return !error;
  } catch (e) {
    console.error(`Error checking if ${tableName} exists:`, e);
    return false;
  }
}

// Helper function to create the storage_tokens table
async function createStorageTokensTable(supabase) {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS storage_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES auth.users(id),
      provider TEXT NOT NULL,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      expires_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE(user_id, provider)
    );
  `;
  
  const { error: createError } = await supabase.rpc('exec_sql', { query: createTableQuery });
  
  if (createError) {
    console.error('Failed to create storage_tokens table:', createError);
    throw new Error('Failed to create storage_tokens table');
  }
  
  console.log('storage_tokens table created successfully');
}

// Helper function to log events
async function logEvent(supabase, userId, eventType, message, details = {}) {
  try {
    // Check if destination_logs table exists
    const logsTableExists = await checkTableExists(supabase, 'destination_logs');
    
    if (!logsTableExists) {
      console.log('Creating destination_logs table...');
      const createLogsTableQuery = `
        CREATE TABLE IF NOT EXISTS destination_logs (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id),
          event_type TEXT NOT NULL,
          message TEXT NOT NULL,
          details JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { query: createLogsTableQuery });
      
      if (createError) {
        console.error('Failed to create destination_logs table:', createError);
        return; // Continue without logging
      }
    }
    
    await supabase
      .from('destination_logs')
      .insert({
        user_id: userId,
        event_type: eventType,
        message,
        details
      });
  } catch (error) {
    console.error('Error logging event:', error);
    // Don't throw, just continue without logging
  }
}
