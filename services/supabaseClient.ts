
import { createClient } from '@supabase/supabase-js';

// IMPORTANT: Replace with your actual Supabase Project URL and Anon Key
// It's recommended to store these in environment variables
const supabaseUrl: string = 'https://zmqwkommslchdingblhq.supabase.co';
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptcXdrb21tc2xjaGRpbmdibGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyODYyMzYsImV4cCI6MjA3ODg2MjIzNn0.08Dv0wwIH7rwPVufojS65KuVzVBylaX6_6HLOGbi1CU';

export const isSupabaseConfigured =
  supabaseUrl &&
  !supabaseUrl.startsWith('YOUR_') &&
  supabaseAnonKey &&
  !supabaseAnonKey.startsWith('YOUR_');

// Pass empty strings if not configured to avoid an immediate crash.
// The `isSupabaseConfigured` flag will prevent the app from using the client anyway.
export const supabase = createClient(
    isSupabaseConfigured ? supabaseUrl : '',
    isSupabaseConfigured ? supabaseAnonKey : ''
);

if (!isSupabaseConfigured) {
    console.warn("Supabase is not configured. Please update services/supabaseClient.ts");
}