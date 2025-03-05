
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
    
    // Validate destination ID
    if (!requestData.destination_id) {
      return new Response(
        JSON.stringify({ error: 'Destination ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get destination details
    const { data: destination, error: destError } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', requestData.destination_id)
      .eq('user_id', user.id)
      .single();
    
    if (destError || !destination) {
      return new Response(
        JSON.stringify({ error: 'Destination not found or you do not have permission to access it' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create an export log entry
    const { data: exportLog, error: logError } = await supabase
      .from('export_logs')
      .insert([{
        destination_id: destination.id,
        user_id: user.id,
        status: 'In Progress'
      }])
      .select();
    
    if (logError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create export log', details: logError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Start the export process in the background
    const exportPromise = performExport(supabase, destination, exportLog[0].id, user.id);
    
    // We don't await the export promise since it could take time
    // Instead, we start it and return a response immediately
    EdgeRuntime.waitUntil(exportPromise);
    
    return new Response(
      JSON.stringify({ 
        message: 'Export process started', 
        export_id: exportLog[0].id,
        status: 'In Progress'
      }),
      { status: 202, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error starting export:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Perform the actual export operation (runs asynchronously)
async function performExport(supabase: any, destination: any, exportId: string, userId: string) {
  try {
    console.log(`Starting export to ${destination.destination_type} for log ID: ${exportId}`);
    
    // Simulate data processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Prepare mock data for export (in a real app, this would come from the database)
    const dataToExport = generateMockData(destination.export_format);
    
    // Simulate export based on destination type
    let exportResult;
    
    switch (destination.destination_type) {
      case 'Google Drive':
        exportResult = await exportToGoogleDrive(destination, dataToExport);
        break;
      case 'Microsoft OneDrive':
        exportResult = await exportToOneDrive(destination, dataToExport);
        break;
      case 'AWS S3':
        exportResult = await exportToAwsS3(destination, dataToExport);
        break;
      case 'FTP/SFTP':
        exportResult = await exportToFtp(destination, dataToExport);
        break;
      case 'Custom API':
        exportResult = await exportToCustomApi(destination, dataToExport);
        break;
      default:
        throw new Error(`Unsupported destination type: ${destination.destination_type}`);
    }
    
    // Update the export log with the result
    if (exportResult.success) {
      await supabase
        .from('export_logs')
        .update({
          status: 'Success',
          file_url: exportResult.file_url,
          file_size: exportResult.file_size
        })
        .eq('id', exportId);
    } else {
      await supabase
        .from('export_logs')
        .update({
          status: 'Failed',
          error_message: exportResult.error
        })
        .eq('id', exportId);
    }
    
    console.log(`Export completed for log ID: ${exportId}, status: ${exportResult.success ? 'Success' : 'Failed'}`);
    
    return exportResult;
  } catch (error) {
    console.error(`Export error for log ID: ${exportId}:`, error);
    
    // Update the export log with the error
    await supabase
      .from('export_logs')
      .update({
        status: 'Failed',
        error_message: error.message
      })
      .eq('id', exportId);
    
    return { success: false, error: error.message };
  }
}

// Helper functions to simulate exports to various destinations
async function exportToGoogleDrive(destination: any, data: any) {
  // Simulate a Google Drive upload
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 80% chance of success for demo purposes
  if (Math.random() < 0.8) {
    return {
      success: true,
      file_url: 'https://drive.google.com/mock-file-id',
      file_size: data.length
    };
  } else {
    return {
      success: false,
      error: 'Authentication token expired'
    };
  }
}

async function exportToOneDrive(destination: any, data: any) {
  // Simulate a OneDrive upload
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 80% chance of success for demo purposes
  if (Math.random() < 0.8) {
    return {
      success: true,
      file_url: 'https://onedrive.live.com/mock-file-id',
      file_size: data.length
    };
  } else {
    return {
      success: false,
      error: 'Access denied'
    };
  }
}

async function exportToAwsS3(destination: any, data: any) {
  // Simulate an AWS S3 upload
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // 90% chance of success for demo purposes
  if (Math.random() < 0.9) {
    return {
      success: true,
      file_url: `https://${destination.connection_details.bucket}.s3.${destination.connection_details.region}.amazonaws.com/export-${Date.now()}.${destination.export_format.toLowerCase()}`,
      file_size: data.length
    };
  } else {
    return {
      success: false,
      error: 'Invalid credentials'
    };
  }
}

async function exportToFtp(destination: any, data: any) {
  // Simulate an FTP upload
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  // 70% chance of success for demo purposes
  if (Math.random() < 0.7) {
    return {
      success: true,
      file_url: `ftp://${destination.connection_details.host}/${destination.connection_details.path || ''}export-${Date.now()}.${destination.export_format.toLowerCase()}`,
      file_size: data.length
    };
  } else {
    return {
      success: false,
      error: 'Connection refused'
    };
  }
}

async function exportToCustomApi(destination: any, data: any) {
  // Simulate a custom API upload
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 75% chance of success for demo purposes
  if (Math.random() < 0.75) {
    return {
      success: true,
      file_url: `${destination.connection_details.baseUrl}/files/export-${Date.now()}.${destination.export_format.toLowerCase()}`,
      file_size: data.length
    };
  } else {
    return {
      success: false,
      error: 'API returned 403 Forbidden'
    };
  }
}

// Generate mock data for export in the requested format
function generateMockData(format: string) {
  const mockData = [
    { id: 1, name: 'Product A', price: 29.99, category: 'Electronics' },
    { id: 2, name: 'Product B', price: 19.99, category: 'Books' },
    { id: 3, name: 'Product C', price: 49.99, category: 'Electronics' },
    { id: 4, name: 'Product D', price: 9.99, category: 'Clothing' },
    { id: 5, name: 'Product E', price: 39.99, category: 'Home & Garden' }
  ];
  
  switch (format) {
    case 'CSV':
      return 'id,name,price,category\n' + 
             mockData.map(item => `${item.id},"${item.name}",${item.price},"${item.category}"`).join('\n');
    
    case 'JSON':
      return JSON.stringify(mockData, null, 2);
    
    case 'Parquet':
      // For simplicity, we'll just return a mock string representing Parquet data
      return `MOCK_PARQUET_DATA_${new Date().toISOString()}`;
    
    default:
      return JSON.stringify(mockData);
  }
}
