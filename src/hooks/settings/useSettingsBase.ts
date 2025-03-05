
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
  profile_picture_url?: string | null;
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
      console.log(`Invoking settings function: ${action} with data:`, data);
      const response = await supabase.functions.invoke("settings", {
        body: {
          action,
          userId: user.id,
          data
        }
      });
      
      if (response.error) {
        console.error(`Error response from settings function:`, response.error);
        throw response.error;
      }
      
      console.log(`Successful response from settings function:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error invoking ${action}:`, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload profile picture to Supabase Storage
  const uploadProfilePicture = async (file: File) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/profile-picture.${fileExt}`;
      
      // Upload the file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      // Update the profile with the profile picture URL
      await invokeSettingsFunction("update_profile", {
        profile_picture_url: urlData.publicUrl
      });
      
      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
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
    invokeSettingsFunction,
    uploadProfilePicture
  };
}
