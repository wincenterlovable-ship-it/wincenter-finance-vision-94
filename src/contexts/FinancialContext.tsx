import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CashFlowEntry {
  id: string;
  description: string;
  type: 'entrada' | 'saida';
  amount: number;
  date: string;
  category: string;
  status?: string;
  paymentMethod?: string;
}

interface OperationalCost {
  id: string;
  description: string;
  type: 'fixo' | 'variavel';
  amount: number;
  date: string;
  category: string;
}

interface Debt {
  id: string;
  creditor: string;
  description: string;
  amount: number;
  installments: number;
  installmentValue: number;
  totalWithInterest: number;
  dueDate: string;
  justification: string;
  additionalTerms: string;
  status: 'pending' | 'negotiating' | 'overdue' | 'resolved';
}

interface FinancialContextType {
  cashFlowEntries: CashFlowEntry[];
  operationalCosts: OperationalCost[];
  debts: Debt[];
  selectedDate: string | null;
  loading: boolean;
  setSelectedDate: (date: string | null) => void;
  addCashFlowEntry: (entry: Omit<CashFlowEntry, 'id'>) => Promise<void>;
  addOperationalCost: (cost: Omit<OperationalCost, 'id'>) => Promise<void>;
  addDebt: (debt: Omit<Debt, 'id'>) => Promise<void>;
  updateCashFlowEntry: (id: string, entry: Partial<CashFlowEntry>) => Promise<void>;
  updateOperationalCost: (id: string, cost: Partial<OperationalCost>) => Promise<void>;
  updateDebt: (id: string, debt: Partial<Debt>) => Promise<void>;
  deleteCashFlowEntry: (id: string) => Promise<void>;
  deleteOperationalCost: (id: string) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  getTotalRevenue: () => number;
  getTotalExpenses: () => number;
  getTotalDebts: () => number;
  getTotalOperationalCosts: () => number;
  getNetCashFlow: () => number;
  getFilteredCashFlowEntries: () => CashFlowEntry[];
  getFilteredOperationalCosts: () => OperationalCost[];
  getFilteredDebts: () => Debt[];
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

interface FinancialProviderProps {
  children: ReactNode;
}

export const FinancialProvider = ({ children }: FinancialProviderProps) => {
  const [cashFlowEntries, setCashFlowEntries] = useState<CashFlowEntry[]>([]);
  const [operationalCosts, setOperationalCosts] = useState<OperationalCost[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load cash flow entries
      const { data: cashFlowData } = await supabase
        .from('cash_flow_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Load operational costs
      const { data: operationalData } = await supabase
        .from('operational_costs')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Load debts
      const { data: debtsData } = await supabase
        .from('debts')
        .select('*')
        .order('created_at', { ascending: false });

      if (cashFlowData) {
        const mappedCashFlow = cashFlowData.map(item => ({
          id: item.id,
          description: item.description,
          type: item.type as 'entrada' | 'saida',
          amount: Number(item.amount),
          date: item.date,
          category: item.category,
          status: item.status,
          paymentMethod: item.payment_method
        }));
        setCashFlowEntries(mappedCashFlow);
      }

      if (operationalData) {
        const mappedOperational = operationalData.map(item => ({
          id: item.id,
          description: item.description,
          type: item.type as 'fixo' | 'variavel',
          amount: Number(item.amount),
          date: item.date,
          category: item.category
        }));
        setOperationalCosts(mappedOperational);
      }

      if (debtsData) {
        const mappedDebts = debtsData.map(item => ({
          id: item.id,
          creditor: item.creditor,
          description: item.description,
          amount: Number(item.amount),
          installments: item.installments,
          installmentValue: Number(item.installment_value),
          totalWithInterest: Number(item.total_with_interest),
          dueDate: item.due_date,
          justification: item.justification,
          additionalTerms: item.additional_terms,
          status: item.status as 'pending' | 'negotiating' | 'overdue' | 'resolved'
        }));
        setDebts(mappedDebts);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCashFlowEntry = async (entry: Omit<CashFlowEntry, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('cash_flow_entries')
        .insert({
          description: entry.description,
          type: entry.type,
          amount: entry.amount,
          date: entry.date,
          category: entry.category,
          status: entry.status,
          payment_method: entry.paymentMethod,
          user_id: null
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newEntry = {
          id: data.id,
          description: data.description,
          type: data.type as 'entrada' | 'saida',
          amount: Number(data.amount),
          date: data.date,
          category: data.category,
          status: data.status,
          paymentMethod: data.payment_method
        };
        setCashFlowEntries(prev => [newEntry, ...prev]);
      }
    } catch (error) {
      console.error('Error adding cash flow entry:', error);
    }
  };

  const addOperationalCost = async (cost: Omit<OperationalCost, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('operational_costs')
        .insert({
          description: cost.description,
          type: cost.type,
          amount: cost.amount,
          date: cost.date,
          category: cost.category,
          user_id: null
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCost = {
          id: data.id,
          description: data.description,
          type: data.type as 'fixo' | 'variavel',
          amount: Number(data.amount),
          date: data.date,
          category: data.category
        };
        setOperationalCosts(prev => [newCost, ...prev]);
      }
    } catch (error) {
      console.error('Error adding operational cost:', error);
    }
  };

  const addDebt = async (debt: Omit<Debt, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('debts')
        .insert({
          creditor: debt.creditor,
          description: debt.description,
          amount: debt.amount,
          installments: debt.installments,
          installment_value: debt.installmentValue,
          total_with_interest: debt.totalWithInterest,
          due_date: debt.dueDate,
          justification: debt.justification,
          additional_terms: debt.additionalTerms,
          status: debt.status,
          user_id: null
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newDebt = {
          id: data.id,
          creditor: data.creditor,
          description: data.description,
          amount: Number(data.amount),
          installments: data.installments,
          installmentValue: Number(data.installment_value),
          totalWithInterest: Number(data.total_with_interest),
          dueDate: data.due_date,
          justification: data.justification,
          additionalTerms: data.additional_terms,
          status: data.status as 'pending' | 'negotiating' | 'overdue' | 'resolved'
        };
        setDebts(prev => [newDebt, ...prev]);

        // Automaticamente adicionar a parcela como custo operacional fixo
        if (newDebt.installmentValue > 0) {
          await addOperationalCost({
            description: `Parcela - ${newDebt.creditor}`,
            type: 'fixo',
            amount: newDebt.installmentValue,
            date: newDebt.dueDate,
            category: 'financial'
          });
        }
      }
    } catch (error) {
      console.error('Error adding debt:', error);
    }
  };

  const updateCashFlowEntry = async (id: string, updatedEntry: Partial<CashFlowEntry>) => {
    try {
      const { error } = await supabase
        .from('cash_flow_entries')
        .update({
          ...(updatedEntry.description && { description: updatedEntry.description }),
          ...(updatedEntry.type && { type: updatedEntry.type }),
          ...(updatedEntry.amount !== undefined && { amount: updatedEntry.amount }),
          ...(updatedEntry.date && { date: updatedEntry.date }),
          ...(updatedEntry.category && { category: updatedEntry.category }),
          ...(updatedEntry.status && { status: updatedEntry.status }),
          ...(updatedEntry.paymentMethod && { payment_method: updatedEntry.paymentMethod }),
        })
        .eq('id', id);

      if (error) throw error;

      setCashFlowEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, ...updatedEntry } : entry
      ));
    } catch (error) {
      console.error('Error updating cash flow entry:', error);
    }
  };

  const updateOperationalCost = async (id: string, updatedCost: Partial<OperationalCost>) => {
    try {
      const { error } = await supabase
        .from('operational_costs')
        .update({
          ...(updatedCost.description && { description: updatedCost.description }),
          ...(updatedCost.type && { type: updatedCost.type }),
          ...(updatedCost.amount !== undefined && { amount: updatedCost.amount }),
          ...(updatedCost.date && { date: updatedCost.date }),
          ...(updatedCost.category && { category: updatedCost.category }),
        })
        .eq('id', id);

      if (error) throw error;

      setOperationalCosts(prev => prev.map(cost => 
        cost.id === id ? { ...cost, ...updatedCost } : cost
      ));
    } catch (error) {
      console.error('Error updating operational cost:', error);
    }
  };

  const updateDebt = async (id: string, updatedDebt: Partial<Debt>) => {
    try {
      const { error } = await supabase
        .from('debts')
        .update({
          ...(updatedDebt.creditor && { creditor: updatedDebt.creditor }),
          ...(updatedDebt.description && { description: updatedDebt.description }),
          ...(updatedDebt.amount !== undefined && { amount: updatedDebt.amount }),
          ...(updatedDebt.installments !== undefined && { installments: updatedDebt.installments }),
          ...(updatedDebt.installmentValue !== undefined && { installment_value: updatedDebt.installmentValue }),
          ...(updatedDebt.totalWithInterest !== undefined && { total_with_interest: updatedDebt.totalWithInterest }),
          ...(updatedDebt.dueDate && { due_date: updatedDebt.dueDate }),
          ...(updatedDebt.justification && { justification: updatedDebt.justification }),
          ...(updatedDebt.additionalTerms && { additional_terms: updatedDebt.additionalTerms }),
          ...(updatedDebt.status && { status: updatedDebt.status }),
        })
        .eq('id', id);

      if (error) throw error;

      setDebts(prev => prev.map(debt => 
        debt.id === id ? { ...debt, ...updatedDebt } : debt
      ));
    } catch (error) {
      console.error('Error updating debt:', error);
    }
  };

  const deleteCashFlowEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cash_flow_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCashFlowEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error deleting cash flow entry:', error);
    }
  };

  const deleteOperationalCost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('operational_costs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setOperationalCosts(prev => prev.filter(cost => cost.id !== id));
    } catch (error) {
      console.error('Error deleting operational cost:', error);
    }
  };

  const deleteDebt = async (id: string) => {
    try {
      // Get the debt info before deleting
      const debtToDelete = debts.find(debt => debt.id === id);
      
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDebts(prev => prev.filter(debt => debt.id !== id));
      
      // Remove related operational costs (installments)
      if (debtToDelete) {
        const { error: costError } = await supabase
          .from('operational_costs')
          .delete()
          .eq('description', `Parcela - ${debtToDelete.creditor}`);

        if (costError) {
          console.error('Error deleting related operational costs:', costError);
        } else {
          // Reload operational costs to reflect changes
          setOperationalCosts(prev => prev.filter(cost => 
            cost.description !== `Parcela - ${debtToDelete.creditor}`
          ));
        }
      }
    } catch (error) {
      console.error('Error deleting debt:', error);
    }
  };

  const getFilteredCashFlowEntries = () => {
    if (!selectedDate) return cashFlowEntries;
    return cashFlowEntries.filter(entry => entry.date === selectedDate);
  };

  const getFilteredOperationalCosts = () => {
    if (!selectedDate) return operationalCosts;
    return operationalCosts.filter(cost => cost.date === selectedDate);
  };

  const getFilteredDebts = () => {
    if (!selectedDate) return debts;
    return debts.filter(debt => debt.dueDate === selectedDate);
  };

  const getTotalRevenue = () => {
    return getFilteredCashFlowEntries()
      .filter(entry => entry.type === 'entrada')
      .reduce((total, entry) => total + entry.amount, 0);
  };

  const getTotalExpenses = () => {
    return getFilteredCashFlowEntries()
      .filter(entry => entry.type === 'saida')
      .reduce((total, entry) => total + entry.amount, 0);
  };

  const getTotalDebts = () => {
    return getFilteredDebts().reduce((total, debt) => total + debt.amount, 0);
  };

  const getTotalOperationalCosts = () => {
    return getFilteredOperationalCosts().reduce((total, cost) => total + cost.amount, 0);
  };

  const getNetCashFlow = () => {
    return getTotalRevenue() - getTotalExpenses();
  };

  const value: FinancialContextType = {
    cashFlowEntries,
    operationalCosts,
    debts,
    selectedDate,
    loading,
    setSelectedDate,
    addCashFlowEntry,
    addOperationalCost,
    addDebt,
    updateCashFlowEntry,
    updateOperationalCost,
    updateDebt,
    deleteCashFlowEntry,
    deleteOperationalCost,
    deleteDebt,
    getTotalRevenue,
    getTotalExpenses,
    getTotalDebts,
    getTotalOperationalCosts,
    getNetCashFlow,
    getFilteredCashFlowEntries,
    getFilteredOperationalCosts,
    getFilteredDebts,
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};