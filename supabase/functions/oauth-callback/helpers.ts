
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to check if a table exists
export async function checkTableExists(supabase, tableName) {
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
export async function createStorageTokensTable(supabase) {
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
export async function logEvent(supabase, userId, eventType, message, details = {}) {
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

// Create Supabase client
export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Validate user from token
export async function validateUser(supabase, token) {
  if (!token) {
    throw new Error('Missing authorization header');
  }
  
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    console.error('User validation error:', userError);
    throw new Error('Invalid token or user not found');
  }
  
  return user;
}

// Get provider configuration
export function getProviderConfig(provider) {
  const tokenUrl = provider === 'google_drive'
    ? 'https://oauth2.googleapis.com/token'
    : 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    
  const clientId = provider === 'google_drive'
    ? Deno.env.get('GOOGLE_CLIENT_ID')
    : Deno.env.get('MICROSOFT_CLIENT_ID');
    
  const clientSecret = provider === 'google_drive'
    ? Deno.env.get('GOOGLE_CLIENT_SECRET')
    : Deno.env.get('MICROSOFT_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('OAuth provider not properly configured');
  }
  
  return { tokenUrl, clientId, clientSecret };
}

// Store token in database
export async function storeToken(supabase, user, provider, tokenData) {
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
  
  return tokenRecord;
}
