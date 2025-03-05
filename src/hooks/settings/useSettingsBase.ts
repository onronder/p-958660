
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  timezone: string;
  language: string;
  dark_mode: boolean;
  notifications_enabled: boolean;
  auto_logout_minutes: number;
  onboarding_completed: boolean;
}

export interface SecuritySettings {
  id: string;
  user_id: string;
  two_factor_enabled: boolean;
  last_password_change: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  api_key: string;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
}

export interface Webhook {
  id: string;
  user_id: string;
  name: string;
  endpoint_url: string;
  event_type: string;
  secret_key: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  last_triggered_at: string | null;
}

export function useSettingsBase() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Helper to invoke Supabase functions
  const invokeSettingsFunction = async (action: string, data?: any) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke("settings", {
        body: {
          action,
          userId: user.id,
          data
        }
      });
      
      if (response.error) throw response.error;
      return response.data;
    } catch (error) {
      console.error(`Error invoking ${action}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    toast,
    isLoading,
    setIsLoading,
    invokeSettingsFunction
  };
}
