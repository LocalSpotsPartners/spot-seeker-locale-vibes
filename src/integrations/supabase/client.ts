
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rfttdktlmcnfltonvdzd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdHRka3RsbWNuZmx0b252ZHpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUyNDE2NjEsImV4cCI6MjA2MDgxNzY2MX0.PxpOHX-tZ3EP7u3LarYo4WaS5OFyf60DUjgUzSdt82g";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
  },
});
