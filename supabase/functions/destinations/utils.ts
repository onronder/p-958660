
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
};

export function createResponse(data: any, status: number) {
  return new Response(
    JSON.stringify(data),
    { 
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

export function parsePathForId(path: string): string | null {
  const parts = path.split('/').filter(Boolean);
  return parts.length > 1 ? parts[1] : null;
}
