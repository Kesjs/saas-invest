import { supabase, formatResponse } from '../supabase/supabaseClient';

export const getInvestmentPlans = async () => {
  const { data, error } = await supabase
    .from('investment_plans')
    .select('*')
    .eq('is_active', true)
    .order('min_amount', { ascending: true });

  return formatResponse({ data, error });
};

export const createInvestmentPlan = async (planData) => {
  const { data, error } = await supabase
    .from('investment_plans')
    .insert([planData])
    .select()
    .single();

  return formatResponse({ data, error });
};

export const updateInvestmentPlan = async (id, updates) => {
  const { data, error } = await supabase
    .from('investment_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return formatResponse({ data, error });
};

export const deleteInvestmentPlan = async (id) => {
  const { error } = await supabase
    .from('investment_plans')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
};

export const subscribeToInvestmentPlans = (callback) => {
  const subscription = supabase
    .channel('investment_plans_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'investment_plans'
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};
