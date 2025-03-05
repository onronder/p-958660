
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Initialize the Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Get request body
    const requestData = await req.json()
    const { action, userId, data } = requestData
    
    console.log(`Processing settings action: ${action} for user ${userId}`)

    // Handle different actions
    let result = null
    
    switch (action) {
      case 'get_profile':
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
        
        result = { profile }
        break

      case 'update_profile':
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update(data)
          .eq('id', userId)
          .select()
          .single()
        
        if (updateError) throw updateError
        
        result = { profile: updatedProfile }
        break

      case 'update_security':
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
        
        result = { security }
        break

      case 'get_security':
        const { data: userSecurity, error: getUserSecurityError } = await supabase
          .from('user_security')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle()
        
        if (getUserSecurityError) throw getUserSecurityError
        
        result = { security: userSecurity }
        break

      case 'get_api_keys':
        const { data: apiKeys, error: apiKeysError } = await supabase
          .from('api_keys')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        if (apiKeysError) throw apiKeysError
        
        result = { apiKeys }
        break

      case 'create_api_key':
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
        
        result = { apiKey: createdKey, key: apiKey }
        break

      case 'delete_api_key':
        const { error: deleteKeyError } = await supabase
          .from('api_keys')
          .delete()
          .eq('id', data.keyId)
          .eq('user_id', userId)
        
        if (deleteKeyError) throw deleteKeyError
        
        result = { success: true }
        break

      case 'get_webhooks':
        const { data: webhooks, error: webhooksError } = await supabase
          .from('webhooks')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
        
        if (webhooksError) throw webhooksError
        
        result = { webhooks }
        break

      case 'create_webhook':
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
        
        result = { webhook: createdWebhook }
        break

      case 'update_webhook':
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
        
        result = { webhook: updatedWebhook }
        break

      case 'delete_webhook':
        const { error: deleteWebhookError } = await supabase
          .from('webhooks')
          .delete()
          .eq('id', data.webhookId)
          .eq('user_id', userId)
        
        if (deleteWebhookError) throw deleteWebhookError
        
        result = { success: true }
        break

      case 'complete_onboarding':
        const { error: completeOnboardingError } = await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', userId)
        
        if (completeOnboardingError) throw completeOnboardingError
        
        result = { success: true }
        break

      case 'update_preferences':
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
        
        result = { preferences: updatedPreferences }
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return new Response(JSON.stringify(result), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json' 
      },
      status: 200,
    })
  } catch (error) {
    console.error('Error processing settings request:', error)
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400,
    })
  }
})
