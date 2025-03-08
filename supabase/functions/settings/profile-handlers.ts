
import { createSupabaseClient } from './helpers.ts'

export async function getProfile(userId: string) {
  const supabase = createSupabaseClient()
  
  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (profileError) throw profileError
  
  // Check if user has security settings
  const { data: securitySettings, error: securityError } = await supabase
    .from('user_security')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  
  if (securityError) throw securityError
  
  // If no security settings exist, create default ones
  if (!securitySettings) {
    const { error: createSecurityError } = await supabase
      .from('user_security')
      .insert({
        user_id: userId,
        two_factor_enabled: false,
      })
    
    if (createSecurityError) throw createSecurityError
  }
  
  return { profile }
}

export async function updateProfile(userId: string, data: any) {
  const supabase = createSupabaseClient()
  
  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update(data)
    .eq('id', userId)
    .select()
    .single()
  
  if (updateError) throw updateError
  
  return { profile: updatedProfile }
}

export async function completeOnboarding(userId: string) {
  const supabase = createSupabaseClient()
  
  const { error: completeOnboardingError } = await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', userId)
  
  if (completeOnboardingError) throw completeOnboardingError
  
  return { success: true }
}

export async function updatePreferences(userId: string, data: any) {
  const supabase = createSupabaseClient()
  
  const { data: updatedPreferences, error: updatePrefError } = await supabase
    .from('profiles')
    .update({
      dark_mode: data.dark_mode,
      notifications_enabled: data.notifications_enabled,
      timezone: data.timezone,
      language: data.language,
      auto_logout_minutes: data.auto_logout_minutes,
    })
    .eq('id', userId)
    .select()
    .single()
  
  if (updatePrefError) throw updatePrefError
  
  return { preferences: updatedPreferences }
}
