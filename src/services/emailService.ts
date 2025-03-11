
import { supabase } from "@/integrations/supabase/client";

export interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
  replyTo?: string;
}

/**
 * Sends an email using the Resend API via Supabase Edge Function
 */
export async function sendEmail(params: EmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: params,
    });

    if (error) {
      console.error("Error invoking send-email function:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

/**
 * Sends a notification email to a user
 */
export async function sendNotificationEmail(
  to: string,
  subject: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1a56db; margin-bottom: 24px;">${subject}</h1>
      <p style="font-size: 16px; line-height: 1.5; color: #374151;">${message}</p>
      <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
        <p style="font-size: 14px; color: #6b7280;">
          This is an automated message from FlowTechs.
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    html,
    text: message,
  });
}
