
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.5.0';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400', // 24 hours cache for preflight requests
};

export function createResponse(data: any, status: number = 200) {
  return new Response(
    JSON.stringify(data),
    { 
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

export function parsePathForId(path: string): string | null {
  const parts = path.split('/').filter(Boolean);
  return parts.length > 1 ? parts[1] : null;
}

// Function to authenticate user from request
export async function authenticateUser(req: Request) {
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    throw new Error('Missing Authorization header');
  }
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration');
  }
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Get the token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Authentication error:', error);
      throw new Error('Invalid or expired token');
    }
    
    return { user, supabase };
  } catch (error) {
    console.error('Error in authenticateUser:', error);
    throw new Error('Authentication failed');
  }
}

// Function to log destination activity
export async function logDestinationActivity(
  supabase: any,
  userId: string,
  destinationId: string | null,
  activityType: string,
  message: string,
  metaData: any = {}
) {
  try {
    const { data, error } = await supabase
      .from('destination_activity_logs')
      .insert([{
        user_id: userId,
        destination_id: destinationId,
        activity_type: activityType,
        message,
        meta_data: metaData
      }]);
      
    if (error) {
      console.error('Error logging destination activity:', error);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to log destination activity:', error);
    // Don't throw here, just log the error to not disrupt the main flow
  }
}

// Function to convert destination type to storage type
export function convertDestinationToStorageType(destinationType: string): string {
  const lowerCaseType = (destinationType || '').toLowerCase();
  
  const mappings: { [key: string]: string } = {
    'google drive': 'google_drive',
    'microsoft onedrive': 'onedrive',
    'aws s3': 'aws_s3',
    'ftp/sftp': 'ftp_sftp',
  };
  
  return mappings[lowerCaseType] || 'custom_api';
}
