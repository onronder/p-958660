
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// This function runs on a schedule to delete destinations that have been marked 
// for deletion for more than 30 days
Deno.serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Find all destinations marked for deletion more than 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: expiredDestinations, error: findError } = await supabase
      .from('destinations')
      .select('id, name, user_id')
      .eq('is_deleted', true)
      .lt('deletion_marked_at', thirtyDaysAgo.toISOString());
    
    if (findError) {
      console.error('Error finding expired destinations:', findError);
      return new Response(
        JSON.stringify({ error: findError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${expiredDestinations.length} destinations to permanently delete`);
    
    // Delete all expired destinations and log the activity
    const deletionResults = [];
    
    for (const destination of expiredDestinations) {
      const { error: deleteError } = await supabase
        .from('destinations')
        .delete()
        .eq('id', destination.id);
      
      if (deleteError) {
        console.error(`Error deleting destination ${destination.id}:`, deleteError);
        deletionResults.push({
          id: destination.id,
          success: false,
          error: deleteError.message
        });
      } else {
        console.log(`Successfully deleted destination ${destination.id}`);
        deletionResults.push({
          id: destination.id,
          success: true
        });
        
        // Log the permanent deletion
        await supabase
          .from('destination_logs')
          .insert({
            user_id: destination.user_id,
            event_type: 'destination_auto_deleted',
            message: `Auto-deleted destination after 30 days: ${destination.name || destination.id}`
          });
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        deleted_count: deletionResults.filter(r => r.success).length,
        failed_count: deletionResults.filter(r => !r.success).length,
        results: deletionResults
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in cleanup-destinations function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
