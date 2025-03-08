
import { createSupabaseClient } from './helpers.ts'

export async function getApiKeys(userId: string) {
  const supabase = createSupabaseClient()
  
  const { data: apiKeys, error: apiKeysError } = await supabase
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (apiKeysError) throw apiKeysError
  
  return { apiKeys }
}

export async function createApiKey(userId: string, data: any) {
  const supabase = createSupabaseClient()
  
  // Generate an API key using PostgreSQL function
  const { data: newKeyData, error: generateKeyError } = await supabase
    .rpc('generate_api_key')
  
  if (generateKeyError) throw generateKeyError
  
  const apiKey = newKeyData
  
  // Insert the new API key
  const { data: createdKey, error: createKeyError } = await supabase
    .from('api_keys')
    .insert({
      user_id: userId,
      name: data.name,
      api_key: apiKey,
      expires_at: data.expires_at || null,
    })
    .select()
    .single()
  
  if (createKeyError) throw createKeyError
  
  return { apiKey: createdKey, key: apiKey }
}

export async function deleteApiKey(userId: string, data: any) {
  const supabase = createSupabaseClient()
  
  const { error: deleteKeyError } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', data.keyId)
    .eq('user_id', userId)
  
  if (deleteKeyError) throw deleteKeyError
  
  return { success: true }
}
