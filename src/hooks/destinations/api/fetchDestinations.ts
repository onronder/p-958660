
import { getSupabaseUrl, handleApiError, fetchWithAuth } from "./apiUtils";
import { supabase } from "@/integrations/supabase/client";

// Function to fetch destinations from the API
export async function fetchDestinations() {
  try {
    // First try using Supabase directly (more reliable, but might not work in some environments)
    try {
      console.log("Trying to fetch destinations using Supabase client...");
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        console.log("Successfully fetched destinations using Supabase client:", data);
        
        // Process data for status
        const processedData = data.map(dest => {
          // Since 'is_deleted' doesn't exist, we need to rely on the status field
          if (dest.status === 'Deleted') {
            return { ...dest, status: 'Deleted' };
          }
          return dest;
        });
        
        return processedData;
      }
    } catch (directError) {
      console.warn("Failed to fetch using Supabase client, falling back to edge function:", directError);
    }

    // Fallback to edge function
    const supabaseUrl = getSupabaseUrl();
    const url = `${supabaseUrl}/functions/v1/destinations`;
    
    // Add console.log to debug request
    console.log("Fetching destinations from:", url);
    
    // Use the enhanced fetchWithAuth utility
    const data = await fetchWithAuth(url);
    
    console.log("Destinations data received:", data);
    
    if (!data.destinations) {
      console.warn("No destinations array in the response:", data);
      return []; // Return empty array to avoid undefined errors
    }
    
    return data.destinations;
  } catch (error) {
    console.error("Fetch destinations error:", error);
    
    // Provide a more helpful error message
    if (error instanceof Error && error.message.includes("CORS")) {
      handleApiError(error, "Failed to fetch destinations due to CORS policy. This is likely a server configuration issue.");
    } else {
      handleApiError(error, "Failed to fetch destinations");
    }
    
    // Return empty array to prevent UI breakage
    return [];
  }
}
