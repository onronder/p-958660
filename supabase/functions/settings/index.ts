
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceRole);

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Extract the token from the header
    const token = authHeader.split(' ')[1];

    // Verify the token and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    // Handle different settings-related endpoints
    if (req.method === 'GET') {
      if (path === 'profile') {
        // Get user profile
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ profile: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (path === 'security') {
        // Get user security settings
        const { data, error } = await supabase
          .from('user_security')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // If no security record exists, create one
        if (!data) {
          const { data: newSecurityData, error: insertError } = await supabase
            .from('user_security')
            .insert([{ user_id: user.id }])
            .select()
            .single();

          if (insertError) {
            return new Response(JSON.stringify({ error: insertError.message }), {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }

          return new Response(JSON.stringify({ security: newSecurityData }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ security: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (path === 'api-keys') {
        // Get user API keys
        const { data, error } = await supabase
          .from('api_keys')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ apiKeys: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (path === 'webhooks') {
        // Get user webhooks
        const { data, error } = await supabase
          .from('webhooks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ webhooks: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    } else if (req.method === 'POST') {
      const body = await req.json();

      if (path === 'update-profile') {
        // Update user profile
        const { data, error } = await supabase
          .from('profiles')
          .update(body)
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ profile: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (path === 'change-password') {
        // Change user password
        const { oldPassword, newPassword } = body;

        // Validate old password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email || '',
          password: oldPassword,
        });

        if (signInError) {
          return new Response(JSON.stringify({ error: 'Current password is incorrect' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update password
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: newPassword }
        );

        if (updateError) {
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Update last password change timestamp
        await supabase
          .from('user_security')
          .update({ last_password_change: new Date().toISOString() })
          .eq('user_id', user.id);

        return new Response(JSON.stringify({ success: true, message: 'Password updated successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (path === 'toggle-2fa') {
        // Toggle 2FA
        const { enabled } = body;

        const { data, error } = await supabase
          .from('user_security')
          .update({ two_factor_enabled: enabled })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
          security: data
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (path === 'create-api-key') {
        // Create new API key
        const { name, expiresAt } = body;

        // Generate a secure API key
        const { data: apiKeyData, error: apiKeyError } = await supabase.rpc('generate_api_key');
        
        if (apiKeyError) {
          return new Response(JSON.stringify({ error: apiKeyError.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Insert the new API key
        const { data, error } = await supabase
          .from('api_keys')
          .insert([{
            user_id: user.id,
            name,
            api_key: apiKeyData,
            expires_at: expiresAt,
          }])
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'API key created successfully',
          apiKey: data 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (path === 'delete-api-key') {
        // Delete API key
        const { id } = body;

        const { error } = await supabase
          .from('api_keys')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id); // Ensure the API key belongs to the user

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'API key deleted successfully' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (path === 'create-webhook') {
        // Create new webhook
        const { name, endpoint_url, event_type } = body;

        // Generate a secure secret key for the webhook
        const secretKey = Array.from(crypto.getRandomValues(new Uint8Array(32)))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        // Insert the new webhook
        const { data, error } = await supabase
          .from('webhooks')
          .insert([{
            user_id: user.id,
            name,
            endpoint_url,
            event_type,
            secret_key: secretKey,
          }])
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Webhook created successfully',
          webhook: data 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (path === 'update-webhook') {
        // Update webhook
        const { id, name, endpoint_url, event_type, active } = body;

        const { data, error } = await supabase
          .from('webhooks')
          .update({
            name,
            endpoint_url,
            event_type,
            active,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id)
          .eq('user_id', user.id) // Ensure the webhook belongs to the user
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Webhook updated successfully',
          webhook: data 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (path === 'delete-webhook') {
        // Delete webhook
        const { id } = body;

        const { error } = await supabase
          .from('webhooks')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id); // Ensure the webhook belongs to the user

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Webhook deleted successfully' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (path === 'update-preferences') {
        // Update user preferences
        const { data, error } = await supabase
          .from('profiles')
          .update({
            timezone: body.timezone,
            language: body.language,
            dark_mode: body.dark_mode,
            notifications_enabled: body.notifications_enabled,
            auto_logout_minutes: body.auto_logout_minutes,
          })
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Preferences updated successfully',
          profile: data 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } else if (path === 'complete-onboarding') {
        // Complete onboarding
        const { data, error } = await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Onboarding completed successfully',
          profile: data 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
