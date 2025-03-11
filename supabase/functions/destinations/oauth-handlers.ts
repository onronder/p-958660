
import { createResponse, authenticateUser, logDestinationActivity } from './utils.ts';

export async function handleOAuthConfig(req: Request) {
  try {
    const { user, supabase } = await authenticateUser(req);
    
    if (req.method !== 'POST') {
      return createResponse({ error: 'Method not allowed' }, 405);
    }

    // Parse the request body
    const { provider } = await req.json();
    
    if (!provider) {
      return createResponse({ error: 'Provider is required' }, 400);
    }

    // Get the appropriate client ID based on the provider
    let clientId = '';
    if (provider === 'google_drive') {
      clientId = Deno.env.get('GOOGLE_CLIENT_ID') || '';
    } else if (provider === 'onedrive') {
      clientId = Deno.env.get('MICROSOFT_CLIENT_ID') || '';
    } else {
      return createResponse({ error: 'Invalid provider' }, 400);
    }

    // Log the action
    await logDestinationActivity(
      supabase,
      user.id,
      null,
      'oauth_config_requested',
      `OAuth configuration requested for ${provider}`
    );

    return createResponse({ 
      clientId,
      provider
    });
  } catch (error) {
    console.error('Error getting OAuth configuration:', error);
    
    return createResponse(
      { error: 'Internal server error', details: error.message },
      error.status || 500
    );
  }
}
