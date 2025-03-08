
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export function createSupabaseClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export function createErrorResponse(error: Error) {
  console.error('Error processing settings request:', error)
  
  return new Response(JSON.stringify({ error: error.message }), {
    headers: { 
      ...corsHeaders,
      'Content-Type': 'application/json'
    },
    status: 400,
  })
}

export function createSuccessResponse(result: any) {
  return new Response(JSON.stringify(result), {
    headers: { 
      ...corsHeaders,
      'Content-Type': 'application/json' 
    },
    status: 200,
  })
}
