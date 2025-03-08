
import { createSupabaseClient } from './helpers.ts'

export async function getSecuritySettings(userId: string) {
  const supabase = createSupabaseClient()
  
  const { data: userSecurity, error: getUserSecurityError } = await supabase
    .from('user_security')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  
  if (getUserSecurityError) throw getUserSecurityError
  
  return { security: userSecurity }
}

export async function updateSecuritySettings(userId: string, data: any) {
  const supabase = createSupabaseClient()
  
  const { data: security, error: updateSecurityError } = await supabase
    .from('user_security')
    .update({
      ...data,
      updated_at: new Date(),
    })
    .eq('user_id', userId)
    .select()
    .single()
  
  if (updateSecurityError) throw updateSecurityError
  
  return { security }
}
