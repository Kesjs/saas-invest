import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase/supabaseClient';

// Configuration
const TOKEN_REFRESH_BUFFER = 60 * 5; // 5 minutes avant expiration
const VISIBILITY_CHECK_INTERVAL = 60000; // 1 minute

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigateRef = useRef(null);
  const refreshTimer = useRef(null);
  const visibilityCheckTimer = useRef(null);

  // Initialiser l'état d'authentification
  useEffect(() => {
    console.log('[AUTH] Vérification de la session utilisateur...');
    
    // Vérifier la session active
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AUTH] Erreur lors de la vérification de la session:', error);
          setUser(null);
        } else if (session?.user) {
          console.log('[AUTH] Utilisateur connecté:', session.user.email);
          setUser(session.user);
        } else {
          console.log('[AUTH] Aucun utilisateur connecté');
          setUser(null);
        }
      } catch (error) {
        console.error('[AUTH] Erreur inattendue:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Vérifier la session initiale
    checkSession();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('[AUTH] Événement d\'authentification:', event);
        setUser(session?.user || null);
      }
    );

    // Nettoyer l'abonnement lors du démontage
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Valeur du contexte
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login: async (email, password) => {
      // Implémentation de base de la connexion
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setUser(data.user);
        return data.user;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    logout: async () => {
      await supabase.auth.signOut();
      setUser(null);
    },
    // Ajoutez ici les autres méthodes nécessaires
  };

  // Si en cours de chargement, afficher un écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};

export default AuthContext;