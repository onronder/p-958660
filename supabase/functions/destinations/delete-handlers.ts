
import { createResponse, authenticateUser, logDestinationActivity } from './utils.ts';

// Handler for deleting a destination
export const handleDeleteDestination = async (req: Request, id: string, url: URL) => {
  try {
    const { user, supabase } = await authenticateUser(req);
    const softDelete = url.searchParams.get('soft_delete') !== 'false'; // Default to soft delete
    
    if (!id) {
      return createResponse({ error: 'Destination ID is required' }, 400);
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
        await logDestinationActivity(
          supabase,
          user.id,
          id,
          'destination_delete_error',
          `Failed to delete destination: ${error.message}`,
          { error: error.message }
        );
        
        return createResponse({ error: error.message }, 500);
      }
      
      // Log the successful deletion
      await logDestinationActivity(
        supabase,
        user.id,
        id,
        'destination_soft_deleted',
        `Marked destination for deletion: ${destination?.name || id}`
      );
      
      return createResponse({ 
        success: true, 
        message: 'Destination marked for deletion' 
      });
    } else {
      // Hard delete - remove from database
      // Only allow permanent deletion if already soft deleted
      if (!destination?.is_deleted) {
        return createResponse({ 
          error: 'Destination must be soft deleted before permanent deletion' 
        }, 400);
      }
      
      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        // Log the error
        await logDestinationActivity(
          supabase,
          user.id,
          null,
          'destination_permanent_delete_error',
          `Failed to permanently delete destination: ${error.message}`,
          { error: error.message }
        );
        
        return createResponse({ error: error.message }, 500);
      }
      
      // Log the successful permanent deletion
      await logDestinationActivity(
        supabase,
        user.id,
        null,
        'destination_permanently_deleted',
        `Permanently deleted destination: ${destination?.name || id}`
      );
      
      return createResponse({ 
        success: true, 
        message: 'Destination permanently deleted' 
      });
    }
  } catch (error) {
    console.error('Error in handleDeleteDestination:', error);
    return createResponse({ error: error.message }, 500);
  }
};
