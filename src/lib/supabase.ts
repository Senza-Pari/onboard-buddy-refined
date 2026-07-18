import { createClient } from '@supabase/supabase-js';

// Real project fallbacks so auth calls still reach the backend even when
// build-time env vars are missing (avoids "Failed to fetch" on published sites).
const PROJECT_ID = 'tsfnrqcrttxaorcxkhoy';
const FALLBACK_URL = `https://${PROJECT_ID}.supabase.co`;
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzZm5ycWNydHR4YW9yY3hraG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2MTgxODEsImV4cCI6MjA4NzE5NDE4MX0.tRaH2eewgu5YDxWLvlNQ8tXHoZTo_LXj3Zg4LpnvuDY';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  FALLBACK_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Type helpers for database
export type Tables<_T extends string> = Record<string, unknown> & { id: string };

export type Enums<_T extends string> = string;