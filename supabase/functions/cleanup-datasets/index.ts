
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// This function runs on a schedule to delete datasets that have been marked 
// for deletion for more than 30 days
Deno.serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Find all datasets marked for deletion more than 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: expiredDatasets, error: findError } = await supabase
      .from('user_datasets')
      .select('id, name, user_id')
      .eq('is_deleted', true)
      .lt('deletion_marked_at', thirtyDaysAgo.toISOString());
    
    if (findError) {
      console.error('Error finding expired datasets:', findError);
      return new Response(
        JSON.stringify({ error: findError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${expiredDatasets?.length || 0} datasets to permanently delete`);
    
    // Delete all expired datasets and log the activity
    const deletionResults = [];
    
    if (expiredDatasets) {
      for (const dataset of expiredDatasets) {
        const { error: deleteError } = await supabase
          .from('user_datasets')
          .delete()
          .eq('id', dataset.id);
        
        if (deleteError) {
          console.error(`Error deleting dataset ${dataset.id}:`, deleteError);
          deletionResults.push({
            id: dataset.id,
            success: false,
            error: deleteError.message
          });
        } else {
          console.log(`Successfully deleted dataset ${dataset.id}`);
          deletionResults.push({
            id: dataset.id,
            success: true
          });
          
          // Log the permanent deletion (if a notifications table exists)
          try {
            await supabase
              .from('notifications')
              .insert({
                user_id: dataset.user_id,
                title: 'Dataset Deleted',
                description: `Dataset "${dataset.name}" was permanently deleted after 30 days in trash.`,
                category: 'dataset',
                severity: 'info'
              });
          } catch (notifError) {
            console.error('Error creating notification:', notifError);
          }
        }
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
    console.error('Error in cleanup-datasets function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
