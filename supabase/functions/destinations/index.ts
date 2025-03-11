
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

    // Parse the URL to get the path and any query parameters
    const url = new URL(req.url);
    const path = url.pathname;
    const pathParts = path.split('/').filter(Boolean);
    
    // Handle restore operation
    if (pathParts.length > 2 && pathParts[2] === 'restore') {
      const id = pathParts[1];
      
      if (req.method === 'POST') {
        // Get the destination first to log its name
        const { data: destination, error: fetchError } = await supabase
          .from('destinations')
          .select('name')
          .eq('id', id)
          .eq('user_id', user.id)
          .single();
        
        if (fetchError) {
          return new Response(
            JSON.stringify({ error: 'Destination not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { data, error } = await supabase
          .from('destinations')
          .update({
            is_deleted: false,
            deletion_marked_at: null,
            status: 'Pending', // Reset status to pending
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user.id)
          .select();
        
        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Log the successful restoration
        await supabase
          .from('destination_logs')
          .insert({
            user_id: user.id,
            destination_id: id,
            event_type: 'destination_restored',
            message: `Restored destination: ${destination.name}`
          });
        
        return new Response(
          JSON.stringify({ success: true, destination: data[0] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // GET request to fetch all destinations
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Update the status to "Deleted" for any soft-deleted destinations
      const processedData = data.map(dest => {
        if (dest.is_deleted) {
          return { ...dest, status: 'Deleted' };
        }
        return dest;
      });
      
      return new Response(
        JSON.stringify(processedData),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // POST request to create a new destination
    if (req.method === 'POST') {
      const requestData = await req.json();
      
      // Validate required fields
      const requiredFields = ['name', 'export_format'];
      for (const field of requiredFields) {
        if (!requestData[field]) {
          return new Response(
            JSON.stringify({ error: `Missing required field: ${field}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      // Validate that we have either destination_type or storage_type
      if (!requestData.destination_type && !requestData.storage_type) {
        return new Response(
          JSON.stringify({ error: 'Missing required field: storage_type or destination_type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Ensure we have storage_type
      if (!requestData.storage_type) {
        requestData.storage_type = convertDestinationToStorageType(requestData.destination_type);
      }
      
      // Set initial status to Pending
      requestData.status = 'Pending';
      requestData.user_id = user.id;
      requestData.save_to_storage = !!requestData.save_to_storage;
      
      // Rename "credentials" to "config" if it exists
      if (requestData.credentials && !requestData.config) {
        requestData.config = requestData.credentials;
        delete requestData.credentials;
      }
      
      const { data, error } = await supabase
        .from('destinations')
        .insert([requestData])
        .select();
      
      if (error) {
        // Log the error
        await supabase
          .from('destination_logs')
          .insert({
            user_id: user.id,
            event_type: 'destination_create_error',
            message: `Failed to create destination: ${error.message}`,
            details: { error: error.message, data: requestData }
          });
          
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Log the successful creation
      await supabase
        .from('destination_logs')
        .insert({
          user_id: user.id,
          destination_id: data[0].id,
          event_type: 'destination_created',
          message: `Created destination: ${requestData.name}`
        });
      
      return new Response(
        JSON.stringify({ destination: data[0] }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // PATCH request to update a destination
    if (req.method === 'PATCH') {
      const url = new URL(req.url);
      const id = url.pathname.split('/').pop();
      
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Destination ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const requestData = await req.json();
      requestData.updated_at = new Date().toISOString();
      
      // Convert save_to_storage to boolean
      if (requestData.save_to_storage !== undefined) {
        requestData.save_to_storage = !!requestData.save_to_storage;
      }
      
      // Ensure we have storage_type if destination_type exists
      if (requestData.destination_type && !requestData.storage_type) {
        requestData.storage_type = convertDestinationToStorageType(requestData.destination_type);
      }
      
      // Rename "credentials" to "config" if it exists
      if (requestData.credentials && !requestData.config) {
        requestData.config = requestData.credentials;
        delete requestData.credentials;
      }
      
      const { data, error } = await supabase
        .from('destinations')
        .update(requestData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select();
      
      if (error) {
        // Log the error
        await supabase
          .from('destination_logs')
          .insert({
            user_id: user.id,
            destination_id: id,
            event_type: 'destination_update_error',
            message: `Failed to update destination: ${error.message}`,
            details: { error: error.message, data: requestData }
          });
          
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Destination not found or you do not have permission to update it' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Log the successful update
      await supabase
        .from('destination_logs')
        .insert({
          user_id: user.id,
          destination_id: id,
          event_type: 'destination_updated',
          message: `Updated destination: ${data[0].name}`
        });
      
      return new Response(
        JSON.stringify({ destination: data[0] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // DELETE request to remove a destination
    if (req.method === 'DELETE') {
      const url = new URL(req.url);
      const id = url.pathname.split('/').pop();
      const softDelete = url.searchParams.get('soft_delete') !== 'false'; // Default to soft delete
      
      if (!id) {
        return new Response(
          JSON.stringify({ error: 'Destination ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get the destination first to log its name
      const { data: destination } = await supabase
        .from('destinations')
        .select('name, is_deleted')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (softDelete) {
        // Soft delete - mark as deleted
        const { error } = await supabase
          .from('destinations')
          .update({
            is_deleted: true,
            deletion_marked_at: new Date().toISOString(),
            status: 'Inactive',
            updated_at: new Date().toISOString()
          })
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) {
          // Log the error
          await supabase
            .from('destination_logs')
            .insert({
              user_id: user.id,
              destination_id: id,
              event_type: 'destination_delete_error',
              message: `Failed to delete destination: ${error.message}`,
              details: { error: error.message }
            });
            
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Log the successful deletion
        await supabase
          .from('destination_logs')
          .insert({
            user_id: user.id,
            destination_id: id,
            event_type: 'destination_soft_deleted',
            message: `Marked destination for deletion: ${destination?.name || id}`
          });
        
        return new Response(
          JSON.stringify({ success: true, message: 'Destination marked for deletion' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } else {
        // Hard delete - remove from database
        // Only allow permanent deletion if already soft deleted
        if (!destination?.is_deleted) {
          return new Response(
            JSON.stringify({ error: 'Destination must be soft deleted before permanent deletion' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const { error } = await supabase
          .from('destinations')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);
        
        if (error) {
          // Log the error
          await supabase
            .from('destination_logs')
            .insert({
              user_id: user.id,
              event_type: 'destination_permanent_delete_error',
              message: `Failed to permanently delete destination: ${error.message}`,
              details: { error: error.message }
            });
            
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Log the successful permanent deletion
        await supabase
          .from('destination_logs')
          .insert({
            user_id: user.id,
            event_type: 'destination_permanently_deleted',
            message: `Permanently deleted destination: ${destination?.name || id}`
          });
        
        return new Response(
          JSON.stringify({ success: true, message: 'Destination permanently deleted' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // If none of the methods match
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper function to convert destination_type to storage_type
function convertDestinationToStorageType(destinationType: string): string {
  switch (destinationType) {
    case 'Google Drive': return 'google_drive';
    case 'Microsoft OneDrive': return 'onedrive';
    case 'AWS S3': return 'aws_s3';
    case 'FTP/SFTP': return 'ftp_sftp';
    case 'Custom API': return 'custom_api';
    default: return 'custom_api';
  }
}
