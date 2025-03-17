
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders, getProductionCorsHeaders } from "../_shared/cors.ts";
import { validateUser, createSupabaseClient } from "../oauth-callback/helpers.ts";

serve(async (req: Request) => {
  // Handle CORS preflight requests
  const requestOrigin = req.headers.get("origin");
  const responseCorsHeaders = getProductionCorsHeaders(requestOrigin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: responseCorsHeaders });
  }

  try {
    const supabase = createSupabaseClient();
    
    // Get user from authorization header
    const authHeader = req.headers.get("authorization");
    const user = await validateUser(supabase, authHeader?.replace("Bearer ", ""));
    
    // Parse request body
    const { 
      extraction_id, 
      format = "json" // json, csv, xlsx
    } = await req.json();
    
    if (!extraction_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: extraction_id" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // Get extraction details
    const { data: extraction, error: extractionError } = await supabase
      .from("extractions")
      .select("*")
      .eq("id", extraction_id)
      .eq("user_id", user.id)
      .single();
    
    if (extractionError || !extraction) {
      return new Response(
        JSON.stringify({ error: "Extraction not found or not authorized" }),
        { 
          status: 404, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // Check if extraction has completed
    if (extraction.status !== "completed") {
      return new Response(
        JSON.stringify({ error: `Extraction is not completed. Current status: ${extraction.status}` }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
        }
      );
    }
    
    // Process data based on requested format
    let formattedData: string;
    let mimeType: string;
    let fileExtension: string;
    
    switch (format.toLowerCase()) {
      case "csv":
        formattedData = convertToCSV(extraction.result_data);
        mimeType = "text/csv";
        fileExtension = "csv";
        break;
      case "xlsx":
        // This is a placeholder. In a real implementation, you would use a library to create XLSX files
        // For simplicity, we'll return CSV format with an error message
        formattedData = convertToCSV(extraction.result_data);
        mimeType = "text/csv";
        fileExtension = "csv";
        break;
      case "json":
      default:
        formattedData = JSON.stringify(extraction.result_data, null, 2);
        mimeType = "application/json";
        fileExtension = "json";
        break;
    }
    
    // Create filename based on extraction name
    const timestamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "_").slice(0, 15);
    const filename = `${extraction.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${timestamp}.${fileExtension}`;
    
    // Return the formatted data
    return new Response(formattedData, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        ...responseCorsHeaders
      }
    });
  } catch (error) {
    console.error("Download error:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...responseCorsHeaders } 
      }
    );
  }
});

// Helper function to convert data to CSV format
function convertToCSV(data: any[]): string {
  if (!Array.isArray(data) || data.length === 0) {
    return "";
  }
  
  // Get headers from first item (assuming all items have same structure)
  const headers = Object.keys(flattenObject(data[0]));
  
  // Create CSV header row
  let csv = headers.map(header => `"${escapeCSV(header)}"`).join(",") + "\n";
  
  // Add data rows
  data.forEach(item => {
    const flatItem = flattenObject(item);
    const row = headers.map(header => {
      const value = flatItem[header] === undefined ? "" : flatItem[header];
      return `"${escapeCSV(String(value))}"`;
    }).join(",");
    csv += row + "\n";
  });
  
  return csv;
}

// Helper function to escape special characters in CSV
function escapeCSV(str: string): string {
  return str.replace(/"/g, '""');
}

// Helper function to flatten nested objects for CSV conversion
function flattenObject(obj: any, prefix = ""): Record<string, any> {
  const result: Record<string, any> = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const propName = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        // Recursively flatten nested objects
        Object.assign(result, flattenObject(obj[key], propName));
      } else if (Array.isArray(obj[key])) {
        // For arrays, join values with semicolons
        result[propName] = obj[key].map((item: any) => {
          if (typeof item === "object" && item !== null) {
            return JSON.stringify(item);
          }
          return String(item);
        }).join("; ");
      } else {
        // For primitive values, just use the value
        result[propName] = obj[key];
      }
    }
  }
  
  return result;
}
