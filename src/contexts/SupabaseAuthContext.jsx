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
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[AUTH] Erreur lors de la vérification de la session:', error);
          setUser(null);
        } else if (session?.user) {
          // Vérifier si l'utilisateur a changé avant de mettre à jour l'état
          if (JSON.stringify(session.user) !== JSON.stringify(user)) {
            console.log('[AUTH] Utilisateur connecté:', session.user.email);
            setUser(session.user);
          }
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
      async (event, session) => {
        console.log('[AUTH] Événement d\'authentification:', event);
        
        // Ne mettre à jour l'état que si nécessaire
        if (session?.user) {
          if (JSON.stringify(session.user) !== JSON.stringify(user)) {
            setUser(session.user);
          }
        } else if (user !== null) {
          setUser(null);
        }
      }
    );

    // Nettoyer l'abonnement lors du démontage
    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, []); // Suppression de user comme dépendance

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

  // Charger le profil utilisateur
  const fetchUserProfile = useCallback(async (userData) => {
    if (!userData) return null;
    
    try {
      // Essayer de récupérer le profil
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.id)
        .single();
      
      // Si le profil n'existe pas, le créer
      if (error && error.code === 'PGRST116') {
        return await upsertUserProfile(userData);
      }
      
      if (error) throw error;
      
      // Fusionner les données de l'utilisateur avec le profil
      const userWithProfile = {
        ...userData,
        ...profile,
        // Assurer la rétrocompatibilité
        firstName: profile.first_name || profile.firstName || userData.user_metadata?.first_name || userData.user_metadata?.name?.split(' ')[0] || '',
        lastName: profile.last_name || profile.lastName || userData.user_metadata?.last_name || userData.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
        fullName: profile.full_name || `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || userData.user_metadata?.full_name || userData.user_metadata?.name || ''
      };
      
      setUser(userWithProfile);
      return userWithProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // En cas d'erreur, retourner l'utilisateur de base avec les métadonnées
      const userWithMetadata = {
        ...userData,
        firstName: userData.user_metadata?.first_name || userData.user_metadata?.name?.split(' ')[0] || '',
        lastName: userData.user_metadata?.last_name || userData.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
        fullName: userData.user_metadata?.full_name || userData.user_metadata?.name || ''
      };
      return userWithMetadata;
    }
  }, [upsertUserProfile]);

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
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login: async (email, password) => {
      try {
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
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const userWithProfile = await fetchUserProfile(currentUser);
        setUser(userWithProfile);
        return userWithProfile;
      }
      return null;
    },
    updateProfile: async (updates) => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) throw new Error('Utilisateur non connecté');
        
        const userWithProfile = await upsertUserProfile(currentUser, updates);
        setUser(userWithProfile);
        return userWithProfile;
      } catch (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
    }
  };

  // Mettre à jour l'utilisateur quand la session change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AUTH] Événement d\'authentification:', event);
        
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            const userWithProfile = await fetchUserProfile(session.user);
            setUser(userWithProfile);
          } else {
            setUser(null);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]);

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