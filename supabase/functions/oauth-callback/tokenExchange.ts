
import { getProviderConfig, storeToken, logEvent } from './helpers.ts';

export async function exchangeCodeForToken(supabase, user, provider, code, redirectUri) {
  try {
    console.log(`Requesting token for ${provider} with redirect URI: ${redirectUri}`);
    
    const { tokenUrl, clientId, clientSecret } = getProviderConfig(provider);
    
    console.log(`OAuth provider config:`, {
      tokenUrl,
      clientId: clientId ? "present" : "missing",
      clientSecret: clientSecret ? "present" : "missing"
    });
    
    // Prepare form data for token request
    const formData = new URLSearchParams();
    formData.append('code', code);
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);
    formData.append('redirect_uri', redirectUri);
    formData.append('grant_type', 'authorization_code');
    
    // For OneDrive, we need additional scope information
    if (provider === 'onedrive') {
      formData.append('scope', 'files.readwrite.all offline_access');
    }
    
    // Exchange code for token
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: errorText };
      }
      
      console.error('Token exchange failed - Response status:', tokenResponse.status);
      console.error('Token exchange failed - Error:', errorData);
      console.error('Token exchange failed - Request data:', {
        code: code ? "present" : "missing",
        client_id: clientId ? "present" : "missing", 
        redirect_uri: redirectUri
      });
      
      throw new Error(`Failed to exchange code for token: ${errorData.error || errorText}`);
    }
    
    // Parse token response
    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful:', {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      expiresIn: tokenData.expires_in
    });
    
    // Store token in database
    const tokenRecord = await storeToken(supabase, user, provider, tokenData);
    
    // Log successful token exchange
    try {
      await logEvent(supabase, user.id, 'oauth_token_exchange', `Successfully exchanged OAuth code for ${provider} token`);
    } catch (logError) {
      console.error('Failed to log event (non-critical):', logError);
      // Don't fail the overall operation if just the logging fails
    }
    
    return {
      success: true,
      provider,
      expires_in: tokenData.expires_in || null,
      token_id: tokenRecord && tokenRecord.length > 0 ? tokenRecord[0]?.id : null
    };
  } catch (error) {
    console.error('Error exchanging code for token:', error);
    throw error;
  }
}
