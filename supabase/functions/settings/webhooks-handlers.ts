
import { createSupabaseClient } from './helpers.ts'

export async function getWebhooks(userId: string) {
  const supabase = createSupabaseClient()
  
  const { data: webhooks, error: webhooksError } = await supabase
    .from('webhooks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (webhooksError) throw webhooksError
  
  return { webhooks }
}

export async function createWebhook(userId: string, data: any) {
  const supabase = createSupabaseClient()
  
  // Generate a secret key for the webhook
  const secretKey = Array.from(
    { length: 32 },
    () => Math.floor(Math.random() * 36).toString(36)
  ).join('')
  
  const { data: createdWebhook, error: createWebhookError } = await supabase
    .from('webhooks')
    .insert({
      user_id: userId,
      name: data.name,
      endpoint_url: data.endpoint_url,
      event_type: data.event_type,
      secret_key: secretKey,
      active: true,
    })
    .select()
    .single()
  
  if (createWebhookError) throw createWebhookError
  
  return { webhook: createdWebhook }
}

export async function updateWebhook(userId: string, data: any) {
  const supabase = createSupabaseClient()
  
  const { data: updatedWebhook, error: updateWebhookError } = await supabase
    .from('webhooks')
    .update({
      name: data.name,
      endpoint_url: data.endpoint_url,
      event_type: data.event_type,
      active: data.active,
      updated_at: new Date(),
    })
    .eq('id', data.webhookId)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (updateWebhookError) throw updateWebhookError
  
  return { webhook: updatedWebhook }
}

export async function deleteWebhook(userId: string, data: any) {
  const supabase = createSupabaseClient()
  
  const { error: deleteWebhookError } = await supabase
    .from('webhooks')
    .delete()
    .eq('id', data.webhookId)
    .eq('user_id', userId)
  
  if (deleteWebhookError) throw deleteWebhookError
  
  return { success: true }
}
