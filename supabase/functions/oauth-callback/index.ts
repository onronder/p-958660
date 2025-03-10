
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  corsHeaders,
  createSupabaseClient,
  validateUser
} from './helpers.ts';
import { exchangeCodeForToken } from './tokenExchange.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabase = createSupabaseClient();
    
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : null;
    
    // Validate the user
    let user;
    try {
      user = await validateUser(supabase, token);
    } catch (authError) {
      console.error('Authentication error:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if request method is POST
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const requestBody = await req.json();
    console.log("Received OAuth callback request:", {
      method: req.method,
      provider: requestBody.provider,
      hasCode: !!requestBody.code,
      redirectUri: requestBody.redirectUri
    });
    
    const { provider, code, redirectUri } = requestBody;
    
    // Validate required parameters
    if (!provider || !code || !redirectUri) {
      console.error('Missing required parameters:', { provider, hasCode: !!code, redirectUri });
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing OAuth callback for ${provider} with redirect URI: ${redirectUri}`);

    try {
      // Exchange code for token and store it
      const result = await exchangeCodeForToken(supabase, user, provider, code, redirectUri);
      
      return new Response(
        JSON.stringify(result),
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
