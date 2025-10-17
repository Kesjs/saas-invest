import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { supabase } from '../services/supabase/supabaseClient';

// Configuration
const TOKEN_REFRESH_BUFFER = 60 * 5; // 5 minutes avant expiration
const VISIBILITY_CHECK_INTERVAL = 60000; // 1 minute

const AuthContext = createContext({
  user: null,
  loading: true,
  isInitialized: false,
  isAuthenticated: false,
  login: () => {},
  register: () => {},
  logout: () => {},
  refreshUser: () => {},
  updateProfile: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigateRef = useRef(null);
  const refreshTimer = useRef(null);
  const visibilityCheckTimer = useRef(null);

  // Vérifier la connectivité réseau
  const checkNetworkConnectivity = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout after 5 seconds
      
      const response = await fetch('https://xekcxuigrzxvkiueuorw.supabase.co/rest/v1/', {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('[AUTH] Erreur de connexion au serveur:', error.message);
      return false;
    }
  };

  // État pour suivre si l'initialisation est terminée
  const [isInitialized, setIsInitialized] = useState(false);
  const refreshInterval = useRef(null);
  const authSubscription = useRef(null);

  // Fonction pour gérer la session utilisateur
  const handleSession = useCallback(async (session) => {
    if (!session?.user) {
      console.log('[AUTH] Aucune session utilisateur active');
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      console.log('[AUTH] Session utilisateur détectée:', session.user.email);
      
      // Vérifier si l'utilisateur a un profil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('[AUTH] Erreur lors de la récupération du profil:', profileError);
        setUser(session.user); // On définit quand même l'utilisateur même sans profil
        return;
      }

      // Mettre à jour l'état utilisateur avec les données du profil
      setUser({
        ...session.user,
        profile: profile || null
      });
    } catch (error) {
      console.error('[AUTH] Erreur lors du traitement de la session:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialiser l'état d'authentification
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('[AUTH] Initialisation de l\'authentification...');
        setLoading(true);

        // Vérifier d'abord la session existante
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('[AUTH] Erreur lors de la vérification de la session:', error);
          setUser(null);
          setLoading(false);
          setIsInitialized(true);
          return;
        }

        await handleSession(session);
        setIsInitialized(true);

        // Configurer l'écouteur d'état d'authentification
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!isMounted) return;
            console.log(`[AUTH] Événement d'authentification: ${event}`);
            await handleSession(newSession);
          }
        );
        authSubscription.current = subscription;

        // Mettre en place le rafraîchissement périodique du token
        refreshInterval.current = setInterval(async () => {
          try {
            const { data, error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) throw refreshError;
            if (data?.session) {
              console.log('[AUTH] Session rafraîchie avec succès');
              await handleSession(data.session);
            }
          } catch (refreshError) {
            console.warn('[AUTH] Erreur lors du rafraîchissement de la session:', refreshError);
          }
        }, 1000 * 60 * 30); // Toutes les 30 minutes

      } catch (error) {
        console.error('[AUTH] Erreur lors de l\'initialisation de l\'authentification:', error);
        setUser(null);
        setLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();

    // Nettoyage
    return () => {
      isMounted = false;
      if (refreshInterval.current) clearInterval(refreshInterval.current);
      if (authSubscription.current) {
        authSubscription.current.unsubscribe?.();
      }
    };
  }, []); // Retirer handleSession des dépendances pour éviter les boucles

  // Créer ou mettre à jour le profil utilisateur
  const upsertUserProfile = useCallback(async (userData, profileData = {}) => {
    if (!userData?.id) return userData;

    try {
      const profile = {
        id: userData.id,
        email: userData.email,
        first_name: profileData.firstName || userData.user_metadata?.first_name || userData.user_metadata?.name?.split(' ')[0] || '',
        last_name: profileData.lastName || userData.user_metadata?.last_name || userData.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
        created_at: userData.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...profileData
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profile, { onConflict: 'id' });

      if (error) throw error;

      // Mettre à jour les métadonnées utilisateur si nécessaire
      if (profileData.firstName || profileData.lastName) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            first_name: profile.first_name,
            last_name: profile.last_name,
            full_name: `${profile.first_name} ${profile.last_name}`.trim()
          }
        });

        if (updateError) console.error('Error updating user metadata:', updateError);
      }

      return {
        ...userData,
        ...profile,
        firstName: profile.first_name,
        lastName: profile.last_name,
        fullName: `${profile.first_name} ${profile.last_name}`.trim()
      };
    } catch (error) {
      console.error('Error upserting user profile:', error);
      return userData;
    }
  }, []);

  // Charger le profil utilisateur (version simplifiée)
  const fetchUserProfile = useCallback(async (userData) => {
    if (!userData) return null;
    
    try {
      // Version simplifiée qui ne charge pas le profil depuis la base de données
      // pour éviter les problèmes de chargement infini
      const userWithProfile = {
        ...userData,
        firstName: userData.user_metadata?.first_name || userData.user_metadata?.name?.split(' ')[0] || '',
        lastName: userData.user_metadata?.last_name || userData.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
        fullName: userData.user_metadata?.full_name || userData.user_metadata?.name || ''
      };
      
      setUser(userWithProfile);
      return userWithProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // En cas d'erreur, retourner l'utilisateur de base
      setUser(userData);
      return userData;
    }
  }, []);

  // Fonction d'inscription
  const register = useCallback(async (userData) => {
    try {
      // 1. Créer le compte utilisateur
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            full_name: `${userData.firstName} ${userData.lastName}`.trim(),
            phone: userData.phone || ''
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('Erreur lors de la création du compte');

      // 2. Créer le profil utilisateur
      const userWithProfile = await upsertUserProfile(authData.user, {
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone || '',
        referral_code: userData.referralCode || null
      });

      return userWithProfile;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, [upsertUserProfile]);

  // Valeur du contexte
  const value = useMemo(() => ({
    user,
    loading: loading || !isInitialized,
    isInitialized,
    isAuthenticated: !!user,
    login: async (email, password) => {
      try {
        setLoading(true);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Charger le profil après la connexion
        const userWithProfile = await fetchUserProfile(data.user);
        return userWithProfile || data.user;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    register,
    logout: async () => {
      try {
        setLoading(true);
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    // Rafraîchir les données utilisateur
    refreshUser: async () => {
      try {
        setLoading(true);
        const { data: { user: currentUser }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (currentUser) {
          const userWithProfile = await fetchUserProfile(currentUser);
          setUser(userWithProfile);
          return userWithProfile;
        }
        return null;
      } catch (error) {
        console.error('Error refreshing user:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    updateProfile: async (updates) => {
      try {
        setLoading(true);
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) throw new Error('Utilisateur non connecté');
        
        const userWithProfile = await upsertUserProfile(currentUser, updates);
        setUser(userWithProfile);
        return userWithProfile;
      } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    }
  }), [user, loading, isInitialized, fetchUserProfile, register, upsertUserProfile]);

  // Mettre à jour l'utilisateur quand la session change (version simplifiée)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AUTH] Événement d\'authentification:', event);
        
        // Mettre à jour l'état en fonction de l'événement
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        
        // Toujours arrêter le chargement après un événement d'authentification
        setLoading(false);
      }
    );

    return () => {
      if (subscription?.unsubscribe) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Si l'initialisation n'est pas terminée, afficher un écran de chargement
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        children
      )}
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