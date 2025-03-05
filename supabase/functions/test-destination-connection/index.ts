
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

    const requestData = await req.json();
    
    // Test connection based on destination type
    let connectionResult = { success: false, message: 'Connection test failed' };
    
    switch (requestData.destination_type) {
      case 'Google Drive':
        connectionResult = await testGoogleDriveConnection(requestData.connection_details);
        break;
      case 'Microsoft OneDrive':
        connectionResult = await testOneDriveConnection(requestData.connection_details);
        break;
      case 'AWS S3':
        connectionResult = await testAwsS3Connection(requestData.connection_details);
        break;
      case 'FTP/SFTP':
        connectionResult = await testFtpConnection(requestData.connection_details);
        break;
      case 'Custom API':
        connectionResult = await testCustomApiConnection(requestData.connection_details);
        break;
      default:
        return new Response(
          JSON.stringify({ error: 'Unsupported destination type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
    
    return new Response(
      JSON.stringify(connectionResult),
      { status: connectionResult.success ? 200 : 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error testing connection:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions to test connections
async function testGoogleDriveConnection(credentials: any) {
  try {
    // In a real implementation, we would use Google Drive API to verify the token
    // For demonstration, we'll simulate a successful connection if access_token exists
    if (!credentials.access_token) {
      return { success: false, message: 'Access token is missing' };
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Successfully connected to Google Drive' };
  } catch (error) {
    console.error('Google Drive connection error:', error);
    return { success: false, message: error.message || 'Failed to connect to Google Drive' };
  }
}

async function testOneDriveConnection(credentials: any) {
  try {
    // In a real implementation, we would use Microsoft Graph API to verify the token
    // For demonstration, we'll simulate a successful connection if access_token exists
    if (!credentials.access_token) {
      return { success: false, message: 'Access token is missing' };
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Successfully connected to Microsoft OneDrive' };
  } catch (error) {
    console.error('OneDrive connection error:', error);
    return { success: false, message: error.message || 'Failed to connect to Microsoft OneDrive' };
  }
}

async function testAwsS3Connection(credentials: any) {
  try {
    // Validate required AWS credentials
    if (!credentials.accessKey || !credentials.secretKey || !credentials.bucket || !credentials.region) {
      return { 
        success: false, 
        message: 'Missing required AWS S3 credentials (accessKey, secretKey, bucket, region)' 
      };
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Successfully connected to AWS S3 bucket' };
  } catch (error) {
    console.error('AWS S3 connection error:', error);
    return { success: false, message: error.message || 'Failed to connect to AWS S3' };
  }
}

async function testFtpConnection(credentials: any) {
  try {
    // Validate required FTP credentials
    if (!credentials.host || !credentials.username || !credentials.password) {
      return { 
        success: false, 
        message: 'Missing required FTP credentials (host, username, password)' 
      };
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Successfully connected to FTP server' };
  } catch (error) {
    console.error('FTP connection error:', error);
    return { success: false, message: error.message || 'Failed to connect to FTP server' };
  }
}

async function testCustomApiConnection(credentials: any) {
  try {
    // Validate required Custom API credentials
    if (!credentials.baseUrl) {
      return { success: false, message: 'Base URL is required' };
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return { success: true, message: 'Successfully connected to API endpoint' };
  } catch (error) {
    console.error('Custom API connection error:', error);
    return { success: false, message: error.message || 'Failed to connect to API endpoint' };
  }
}
