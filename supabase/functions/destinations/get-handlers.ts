
import { createResponse, authenticateUser } from './utils.ts';
import { corsHeaders } from "../_shared/cors.ts";

// Handler for fetching all destinations
export async function getDestinations(req: Request) {
  try {
    const { user, supabase } = await authenticateUser(req);
    
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Database error:", error);
      return createResponse({ error: error.message }, 500);
    }
    
    // Update the status for any destinations that have status 'Deleted'
    const processedData = data.map(dest => {
      if (dest.status === 'Deleted') {
        return { ...dest, status: 'Deleted' };
      }
      return dest;
    });
    
    return createResponse({ destinations: processedData });
  } catch (error) {
    console.error('Error in getDestinations:', error);
    return createResponse({ error: error.message }, error.status || 500);
  }
}

// Handler for fetching a single destination by ID
export async function getDestinationById(req: Request, id: string) {
  try {
    const { user, supabase } = await authenticateUser(req);
    
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return createResponse({ error: "Destination not found" }, 404);
      }
      return createResponse({ error: error.message }, 500);
    }
    
    // Update status if it's deleted
    if (data.status === 'Deleted') {
      data.status = 'Deleted';
    }
    
    return createResponse({ destination: data });
  } catch (error) {
    console.error('Error in getDestinationById:', error);
    return createResponse({ error: error.message }, error.status || 500);
  }
}
