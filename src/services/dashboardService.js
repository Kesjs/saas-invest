import { supabase } from './supabase/supabaseClient';

// Récupérer les statistiques du tableau de bord
export const getDashboardStats = async (userId) => {
  const { data, error } = await supabase.rpc('get_dashboard_stats', {
    user_id: userId
  });

  if (error) throw error;
  return data;
};

// Récupérer l'historique des gains
export const getEarningsHistory = async (userId, months = 6) => {
  const { data, error } = await supabase
    .from('user_earnings_history')
    .select('*')
    .eq('user_id', userId)
    .order('month', { ascending: true })
    .limit(months);

  if (error) throw error;
  return data;
};

// Récupérer la répartition du portefeuille
export const getPortfolioDistribution = async (userId) => {
  const { data, error } = await supabase
    .from('user_portfolio_distribution')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
};

// Récupérer les transactions récentes
export const getRecentTransactions = async (userId, limit = 5) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

// Récupérer les performances des investissements
export const getInvestmentPerformance = async (userId) => {
  const { data, error } = await supabase
    .from('user_investment_performance')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

// Mettre à jour le profil utilisateur
export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};
