
import { corsHeaders, createErrorResponse, createSuccessResponse } from './helpers.ts'
import * as profileHandlers from './profile-handlers.ts'
import * as securityHandlers from './security-handlers.ts'
import * as apiKeysHandlers from './api-keys-handlers.ts'
import * as webhooksHandlers from './webhooks-handlers.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get request body
    const requestData = await req.json()
    const { action, userId, data } = requestData
    
    console.log(`Processing settings action: ${action} for user ${userId}`)
    
    // Handle different actions based on their domain
    let result = null
    
    switch (action) {
      // Profile handlers
      case 'get_profile':
        result = await profileHandlers.getProfile(userId)
        break

      case 'update_profile':
        result = await profileHandlers.updateProfile(userId, data)
        break

      case 'complete_onboarding':
        result = await profileHandlers.completeOnboarding(userId)
        break
        
      case 'update_preferences':
        result = await profileHandlers.updatePreferences(userId, data)
        break

      // Security handlers
      case 'get_security':
        result = await securityHandlers.getSecuritySettings(userId)
        break
        
      case 'update_security':
        result = await securityHandlers.updateSecuritySettings(userId, data)
        break

      // API Keys handlers
      case 'get_api_keys':
        result = await apiKeysHandlers.getApiKeys(userId)
        break
        
      case 'create_api_key':
        result = await apiKeysHandlers.createApiKey(userId, data)
        break
        
      case 'delete_api_key':
        result = await apiKeysHandlers.deleteApiKey(userId, data)
        break

      // Webhooks handlers
      case 'get_webhooks':
        result = await webhooksHandlers.getWebhooks(userId)
        break
        
      case 'create_webhook':
        result = await webhooksHandlers.createWebhook(userId, data)
        break
        
      case 'update_webhook':
        result = await webhooksHandlers.updateWebhook(userId, data)
        break
        
      case 'delete_webhook':
        result = await webhooksHandlers.deleteWebhook(userId, data)
        break

      default:
        throw new Error(`Unknown action: ${action}`)
    }

    return createSuccessResponse(result)
  } catch (error) {
    return createErrorResponse(error)
  }
})
