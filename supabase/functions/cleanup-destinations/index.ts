
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

Deno.serve(async (req) => {
  try {
    // This should be called from a scheduled function, validate the request
    const apiKey = req.headers.get('x-api-key');
    const expectedApiKey = Deno.env.get('CLEANUP_API_KEY');
    
    if (apiKey !== expectedApiKey) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get all destinations marked for deletion more than 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();
    
    // Get destinations to delete
    const { data: destinationsToDelete, error: fetchError } = await supabase
      .from('destinations')
      .select('id, name, user_id')
      .eq('is_deleted', true)
      .lt('deletion_marked_at', thirtyDaysAgoStr);
    
    if (fetchError) {
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    if (!destinationsToDelete || destinationsToDelete.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No destinations to clean up', deletedCount: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create logs for each deletion
    const logs = destinationsToDelete.map(dest => ({
      user_id: dest.user_id,
      event_type: 'destination_auto_removed',
      message: `Automatically removed destination after 30 days: ${dest.name}`,
      created_at: new Date().toISOString()
    }));
    
    // Insert logs
    const { error: logError } = await supabase
      .from('destination_logs')
      .insert(logs);
    
    if (logError) {
      console.error('Error creating deletion logs:', logError);
    }
    
    // Delete the destinations
    const { error: deleteError } = await supabase
      .from('destinations')
      .delete()
      .in('id', destinationsToDelete.map(d => d.id));
    
    if (deleteError) {
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        message: 'Cleanup successful', 
        deletedCount: destinationsToDelete.length,
        deletedDestinations: destinationsToDelete.map(d => ({ id: d.id, name: d.name }))
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error during destination cleanup:', error);
    
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
