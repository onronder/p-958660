
// Improved utils for destinations edge function with better CORS handling
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.20.0";

// Define CORS headers allowing requests from all origins
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Max-Age": "86400",
};

// Create a standard response with correct CORS headers
export function createResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: new Headers({
      ...corsHeaders,
      "Content-Type": "application/json",
    }),
  });
}

// Helper function to authenticate user and return both user and supabase client
export async function authenticateUser(req: Request) {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader) {
    throw { status: 401, message: "Missing Authorization header" };
  }
  
  const token = authHeader.replace("Bearer ", "");
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw { status: 500, message: "Missing Supabase configuration" };
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw { status: 401, message: "Invalid authorization token" };
  }
  
  return { user, supabase };
}

// Convert destination_type to storage_type
export function convertDestinationToStorageType(destinationType: string): string {
  const mapping: Record<string, string> = {
    'GoogleDrive': 'cloud_storage',
    'OneDrive': 'cloud_storage',
    'Dropbox': 'cloud_storage',
    'S3': 'object_storage',
    'Azure': 'object_storage',
    'FTP': 'file_transfer',
    'SFTP': 'file_transfer',
    'Email': 'email',
    'Webhook': 'api'
  };
  
  return mapping[destinationType] || 'file_storage';
}

// Log destination activity
export async function logDestinationActivity(
  supabase: any,
  userId: string,
  destinationId: string | null,
  eventType: string,
  message: string,
  details: any = null
) {
  try {
    await supabase.from('destination_logs').insert({
      user_id: userId,
      destination_id: destinationId,
      event_type: eventType,
      message: message,
      details: details
    });
  } catch (error) {
    console.error('Error logging destination activity:', error);
    // Non-critical error, continue execution
  }
}
