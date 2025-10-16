import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xekcxuigrzxvkiueuorw.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhla2N4dWlncnp4dmtpdWV1b3J3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyODU1ODAsImV4cCI6MjA3NTg2MTU4MH0.01hyHEFTda6MfBO7oKOb_WP6Y4Yqz-h-h0o-H9aGvmU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});
