
import { 
  createResponse, 
  authenticateUser, 
  logDestinationActivity, 
  convertDestinationToStorageType 
} from './utils.ts';

// Handler for updating a destination
export const handleUpdateDestination = async (req: Request, id: string) => {
  try {
    const { user, supabase } = await authenticateUser(req);
    
    if (!id) {
      return createResponse({ error: 'Destination ID is required' }, 400);
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
      await logDestinationActivity(
        supabase,
        user.id,
        id,
        'destination_update_error',
        `Failed to update destination: ${error.message}`,
        { error: error.message, data: requestData }
      );
      
      return createResponse({ error: error.message }, 500);
    }
    
    if (!data || data.length === 0) {
      return createResponse({ 
        error: 'Destination not found or you do not have permission to update it' 
      }, 404);
    }
    
    // Log the successful update
    await logDestinationActivity(
      supabase,
      user.id,
      id,
      'destination_updated',
      `Updated destination: ${data[0].name}`
    );
    
    return createResponse({ destination: data[0] });
  } catch (error) {
    console.error('Error in handleUpdateDestination:', error);
    return createResponse({ error: error.message }, 500);
  }
};
