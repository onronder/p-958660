
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { corsHeaders, getProductionCorsHeaders } from "../_shared/cors.ts";
import { Resend } from "npm:resend@2.0.0";
import { getCriticalErrorEmailTemplate } from "../_shared/email-templates.ts";

// Create Resend client with API key from environment variables
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req: Request) => {
  // Get appropriate CORS headers based on request origin
  const requestOrigin = req.headers.get("origin");
  const responseCorsHeaders = getProductionCorsHeaders(requestOrigin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: responseCorsHeaders });
  }

  try {
    // Parse request body
    const { recipientEmail, errorMessage } = await req.json();
    
    // Validate required fields
    if (!recipientEmail || !errorMessage) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: recipientEmail or errorMessage" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...responseCorsHeaders },
        }
      );
    }

    // Get email template
    const { subject, html } = getCriticalErrorEmailTemplate({ errorMessage });

    console.log(`Sending critical error email to: ${recipientEmail}`);
    
    // Send email
    const { data, error } = await resend.emails.send({
      from: "FlowTechs <no-reply@flowtechs.com>",
      to: [recipientEmail],
      subject,
      html,
    });

    if (error) {
      console.error("Resend API error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...responseCorsHeaders },
        }
      );
    }

    console.log("Critical error email sent successfully:", data);
    
    return new Response(
      JSON.stringify({ success: true, data }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...responseCorsHeaders },
      }
    );
  } catch (error) {
    console.error("Error in critical-error-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...responseCorsHeaders },
      }
    );
  }
});
