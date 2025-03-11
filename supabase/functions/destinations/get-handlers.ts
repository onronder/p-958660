
import { createResponse, authenticateUser, logDestinationActivity } from './utils.ts';

// Handler for fetching all destinations
export const handleGetAllDestinations = async (req: Request) => {
  try {
    const { user, supabase } = await authenticateUser(req);
    
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      return createResponse({ error: error.message }, 500);
    }
    
    // Update the status to "Deleted" for any soft-deleted destinations
    const processedData = data.map(dest => {
      if (dest.is_deleted) {
        return { ...dest, status: 'Deleted' };
      }
      return dest;
    });
    
    return createResponse({ destinations: processedData });
  } catch (error) {
    console.error('Error in handleGetAllDestinations:', error);
    return createResponse({ error: error.message }, 401);
  }
};
