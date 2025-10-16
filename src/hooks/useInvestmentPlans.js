import { useState, useEffect } from 'react';
import { 
  getInvestmentPlans, 
  createInvestmentPlan as createPlan, 
  updateInvestmentPlan as updatePlan, 
  deleteInvestmentPlan as deletePlan,
  subscribeToInvestmentPlans
} from '../services/supabase/investmentPlans';

export function useInvestmentPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await getInvestmentPlans();
      setPlans(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
    
    // Set up real-time subscription
    const unsubscribe = subscribeToInvestmentPlans((payload) => {
      if (payload.eventType === 'INSERT') {
        setPlans(prev => [...prev, payload.new]);
      } else if (payload.eventType === 'UPDATE') {
        setPlans(prev => 
          prev.map(plan => 
            plan.id === payload.new.id ? payload.new : plan
          )
        );
      } else if (payload.eventType === 'DELETE') {
        setPlans(prev => 
          prev.filter(plan => plan.id !== payload.old.id)
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const create = async (planData) => {
    try {
      setLoading(true);
      const newPlan = await createPlan(planData);
      return newPlan;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id, updates) => {
    try {
      setLoading(true);
      const updatedPlan = await updatePlan(id, updates);
      return updatedPlan;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    try {
      setLoading(true);
      await deletePlan(id);
      return true;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    plans,
    loading,
    error,
    create,
    update,
    delete: remove,
    refresh: fetchPlans
  };
}
