import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requises');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'sb-auth-token',
    flowType: 'pkce',
  },
  global: {
    headers: { 'x-application-name': 'gazoduc-invest' }
  }
});

export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error);
  throw new Error(error.message || 'Une erreur est survenue avec la base de données');
};

export const formatResponse = ({ data, error }) => {
  if (error) {
    handleSupabaseError(error);
  }
  return data;
};
