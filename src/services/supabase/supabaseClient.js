import { createClient } from '@supabase/supabase-js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Les variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont requises');
}

// Simple fetch with retry logic
const customFetch = async (url, options = {}) => {
  let lastError;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-Client-Info': 'gazoduc-invest-web@1.0.0',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response;
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt < MAX_RETRIES) {
        // Exponential backoff
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch after multiple attempts');
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'sb-auth-token',
    flowType: 'pkce',
    debug: process.env.NODE_ENV === 'development',
  },
  global: {
    headers: { 
      'x-application-name': 'gazoduc-invest',
      'Cache-Control': 'no-store',
    },
    fetch: customFetch,
  },
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
