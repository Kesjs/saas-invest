import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getDashboardStats, 
  getEarningsHistory, 
  getPortfolioDistribution, 
  getRecentTransactions,
  getInvestmentPerformance
} from '../services/dashboardService';
import { supabase } from '../services/supabase/supabaseClient';

export function useDashboardData(userId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    stats: null,
    earningsHistory: [],
    portfolioDistribution: [],
    recentTransactions: [],
    investmentPerformance: []
  });

  const fetchData = useCallback(async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      
      // Charger toutes les données en parallèle
      const [
        stats, 
        earnings, 
        portfolio, 
        transactions,
        performance
      ] = await Promise.all([
        getDashboardStats(userId),
        getEarningsHistory(userId),
        getPortfolioDistribution(userId),
        getRecentTransactions(userId),
        getInvestmentPerformance(userId)
      ]);

      setData({
        stats,
        earningsHistory: earnings,
        portfolioDistribution: portfolio,
        recentTransactions: transactions,
        investmentPerformance: performance
      });
      
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Ajout des dépendances du useCallback

  const subscription = useRef(null);

  useEffect(() => {
    fetchData();
    
    // Configurer l'abonnement aux mises à jour en temps réel
    if (userId) {
      subscription.current = supabase
        .channel('dashboard_updates')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public',
            table: 'transactions',
            filter: `user_id=eq.${userId}`
          }, 
          fetchData
        )
        .subscribe();
    }

    return () => {
      if (subscription.current) {
        supabase.removeChannel(subscription.current);
      }
    };
  }, [userId, fetchData]);

  // Fonction pour rafraîchir manuellement les données
  const refreshData = async () => {
    await fetchData();
  };

  return {
    ...data,
    loading,
    error,
    refreshData
  };
}
