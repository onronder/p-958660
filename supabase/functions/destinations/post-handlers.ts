
import { 
  createResponse, 
  authenticateUser, 
  logDestinationActivity, 
  convertDestinationToStorageType 
} from './utils.ts';

// Handler for creating a new destination
export const handleCreateDestination = async (req: Request) => {
  try {
    const { user, supabase } = await authenticateUser(req);
    const requestData = await req.json();
    
    // Validate required fields
    const requiredFields = ['name', 'export_format'];
    for (const field of requiredFields) {
      if (!requestData[field]) {
        return createResponse({ error: `Missing required field: ${field}` }, 400);
      }
    }
    
    // Validate that we have either destination_type or storage_type
    if (!requestData.destination_type && !requestData.storage_type) {
      return createResponse({ 
        error: 'Missing required field: storage_type or destination_type' 
      }, 400);
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
      await logDestinationActivity(
        supabase,
        user.id,
        null,
        'destination_create_error',
        `Failed to create destination: ${error.message}`,
        { error: error.message, data: requestData }
      );
      
      return createResponse({ error: error.message }, 500);
    }
    
    // Log the successful creation
    await logDestinationActivity(
      supabase,
      user.id,
      data[0].id,
      'destination_created',
      `Created destination: ${requestData.name}`
    );
    
    return createResponse({ destination: data[0] }, 201);
  } catch (error) {
    console.error('Error in handleCreateDestination:', error);
    return createResponse({ error: error.message }, 500);
  }
};

// Handler for restoring a destination
export const handleRestoreDestination = async (req: Request, id: string) => {
  try {
    const { user, supabase } = await authenticateUser(req);
    
    // Get the destination first to log its name
    const { data: destination, error: fetchError } = await supabase
      .from('destinations')
      .select('name')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (fetchError) {
      return createResponse({ error: 'Destination not found' }, 404);
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
      return createResponse({ error: error.message }, 500);
    }
    
    // Log the successful restoration
    await logDestinationActivity(
      supabase,
      user.id,
      id,
      'destination_restored',
      `Restored destination: ${destination.name}`
    );
    
    return createResponse({ success: true, destination: data[0] });
  } catch (error) {
    console.error('Error in handleRestoreDestination:', error);
    return createResponse({ error: error.message }, 500);
  }
};
