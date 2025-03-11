
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Shared CORS headers for all endpoints
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

// Helper to create a Supabase client
export const createSupabaseClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  return createClient(supabaseUrl, supabaseServiceKey);
};

// Helper to authenticate user from request
export const authenticateUser = async (req: Request) => {
  const supabase = createSupabaseClient();
  
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }
  
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
  if (userError || !user) {
    throw new Error('Invalid token or user not found');
  }
  
  return { user, supabase };
};

// Helper to parse path and extract ID
export const parsePathForId = (req: Request) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  return pathParts.length > 1 ? pathParts[1] : null;
};

// Helper to create a response with proper headers
export const createResponse = (body: any, status = 200) => {
  return new Response(
    JSON.stringify(body),
    { 
      status, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      } 
    }
  );
};

// Helper to convert destination_type to storage_type
export const convertDestinationToStorageType = (destinationType: string): string => {
  switch (destinationType) {
    case 'Google Drive': return 'google_drive';
    case 'Microsoft OneDrive': return 'onedrive';
    case 'AWS S3': return 'aws_s3';
    case 'FTP/SFTP': return 'ftp_sftp';
    case 'Custom API': return 'custom_api';
    default: return 'custom_api';
  }
};

// Helper to log destination activity
export const logDestinationActivity = async (
  supabase: any, 
  userId: string, 
  destinationId: string | null, 
  eventType: string, 
  message: string, 
  details: any = null
) => {
  const logEntry = {
    user_id: userId,
    event_type: eventType,
    message,
    details
  };
  
  if (destinationId) {
    logEntry.destination_id = destinationId;
  }
  
  await supabase
    .from('destination_logs')
    .insert(logEntry);
};
