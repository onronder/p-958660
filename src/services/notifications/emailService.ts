
import { supabase } from "@/integrations/supabase/client";

// Welcome email
interface WelcomeEmailParams {
  recipientEmail: string;
  recipientName: string;
}

export async function sendWelcomeEmail(params: WelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("welcome-email", {
      body: params,
    });

    if (error) {
      console.error("Error sending welcome email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Exception sending welcome email:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

// Verification email
interface VerificationEmailParams {
  recipientEmail: string;
  verificationLink: string;
}

export async function sendVerificationEmail(params: VerificationEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("verification-email", {
      body: params,
    });

    if (error) {
      console.error("Error sending verification email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Exception sending verification email:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

// Password reset email
interface PasswordResetEmailParams {
  recipientEmail: string;
  resetLink: string;
}

export async function sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("password-reset-email", {
      body: params,
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Exception sending password reset email:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}

// Critical error email
interface CriticalErrorEmailParams {
  recipientEmail: string;
  errorMessage: string;
}

export async function sendCriticalErrorEmail(params: CriticalErrorEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("critical-error-email", {
      body: params,
    });

    if (error) {
      console.error("Error sending critical error email:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Exception sending critical error email:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
