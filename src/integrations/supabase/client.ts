// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://eovyjotxecnkqjylwdnj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvdnlqb3R4ZWNua3FqeWx3ZG5qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwNTU5ODQsImV4cCI6MjA1NjYzMTk4NH0.dd6M20Oq84AbZatvYPti39c4HpFwqttWDws0UTG0ILM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);