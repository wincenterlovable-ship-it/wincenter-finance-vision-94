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
  setSelectedDate: (date: string | null) => void;
  addCashFlowEntry: (entry: Omit<CashFlowEntry, 'id'>) => void;
  addOperationalCost: (cost: Omit<OperationalCost, 'id'>) => void;
  addDebt: (debt: Omit<Debt, 'id'>) => void;
  updateCashFlowEntry: (id: string, entry: Partial<CashFlowEntry>) => void;
  updateOperationalCost: (id: string, cost: Partial<OperationalCost>) => void;
  updateDebt: (id: string, debt: Partial<Debt>) => void;
  deleteCashFlowEntry: (id: string) => void;
  deleteOperationalCost: (id: string) => void;
  deleteDebt: (id: string) => void;
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

  // Load data from Supabase on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // Load cash flow entries
      const { data: cashFlowData } = await supabase
        .from('cash_flow_entries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (cashFlowData) {
        const formattedCashFlow = cashFlowData.map(entry => ({
          id: entry.id,
          description: entry.description,
          type: entry.type as 'entrada' | 'saida',
          amount: parseFloat(entry.amount.toString()),
          date: entry.date,
          category: entry.category,
          status: entry.status,
          paymentMethod: entry.payment_method
        }));
        setCashFlowEntries(formattedCashFlow);
      }

      // Load operational costs
      const { data: costsData } = await supabase
        .from('operational_costs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (costsData) {
        const formattedCosts = costsData.map(cost => ({
          id: cost.id,
          description: cost.description,
          type: cost.type as 'fixo' | 'variavel',
          amount: parseFloat(cost.amount.toString()),
          date: cost.date,
          category: cost.category
        }));
        setOperationalCosts(formattedCosts);
      }

      // Load debts
      const { data: debtsData } = await supabase
        .from('debts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (debtsData) {
        const formattedDebts = debtsData.map(debt => ({
          id: debt.id,
          creditor: debt.creditor,
          description: debt.description,
          amount: parseFloat(debt.amount.toString()),
          installments: debt.installments,
          installmentValue: parseFloat(debt.installment_value.toString()),
          totalWithInterest: parseFloat(debt.total_with_interest.toString()),
          dueDate: debt.due_date,
          justification: debt.justification,
          additionalTerms: debt.additional_terms,
          status: debt.status as 'pending' | 'negotiating' | 'overdue' | 'resolved'
        }));
        setDebts(formattedDebts);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
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
          payment_method: entry.paymentMethod
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newEntry = {
          id: data.id,
          description: data.description,
          type: data.type as 'entrada' | 'saida',
          amount: parseFloat(data.amount.toString()),
          date: data.date,
          category: data.category,
          status: data.status,
          paymentMethod: data.payment_method
        };
        setCashFlowEntries(prev => [newEntry, ...prev]);
      }
    } catch (error) {
      console.error('Erro ao adicionar entrada de fluxo de caixa:', error);
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
          category: cost.category
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newCost = {
          id: data.id,
          description: data.description,
          type: data.type as 'fixo' | 'variavel',
          amount: parseFloat(data.amount.toString()),
          date: data.date,
          category: data.category
        };
        setOperationalCosts(prev => [newCost, ...prev]);
      }
    } catch (error) {
      console.error('Erro ao adicionar custo operacional:', error);
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
          status: debt.status
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newDebt = {
          id: data.id,
          creditor: data.creditor,
          description: data.description,
          amount: parseFloat(data.amount.toString()),
          installments: data.installments,
          installmentValue: parseFloat(data.installment_value.toString()),
          totalWithInterest: parseFloat(data.total_with_interest.toString()),
          dueDate: data.due_date,
          justification: data.justification,
          additionalTerms: data.additional_terms,
          status: data.status as 'pending' | 'negotiating' | 'overdue' | 'resolved'
        };
        setDebts(prev => [newDebt, ...prev]);
        
        // Automaticamente adicionar a parcela como custo operacional fixo
        if (newDebt.installmentValue > 0) {
          const installmentCost = {
            description: `Parcela - ${newDebt.creditor}`,
            type: 'fixo' as const,
            amount: newDebt.installmentValue,
            date: newDebt.dueDate,
            category: 'financial'
          };
          await addOperationalCost(installmentCost);
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar dívida:', error);
    }
  };

  const updateCashFlowEntry = async (id: string, updatedEntry: Partial<CashFlowEntry>) => {
    try {
      const { error } = await supabase
        .from('cash_flow_entries')
        .update({
          description: updatedEntry.description,
          type: updatedEntry.type,
          amount: updatedEntry.amount,
          date: updatedEntry.date,
          category: updatedEntry.category,
          status: updatedEntry.status,
          payment_method: updatedEntry.paymentMethod
        })
        .eq('id', id);

      if (error) throw error;

      setCashFlowEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, ...updatedEntry } : entry
      ));
    } catch (error) {
      console.error('Erro ao atualizar entrada de fluxo de caixa:', error);
    }
  };

  const updateOperationalCost = async (id: string, updatedCost: Partial<OperationalCost>) => {
    try {
      const { error } = await supabase
        .from('operational_costs')
        .update({
          description: updatedCost.description,
          type: updatedCost.type,
          amount: updatedCost.amount,
          date: updatedCost.date,
          category: updatedCost.category
        })
        .eq('id', id);

      if (error) throw error;

      setOperationalCosts(prev => prev.map(cost => 
        cost.id === id ? { ...cost, ...updatedCost } : cost
      ));
    } catch (error) {
      console.error('Erro ao atualizar custo operacional:', error);
    }
  };

  const updateDebt = async (id: string, updatedDebt: Partial<Debt>) => {
    try {
      const { error } = await supabase
        .from('debts')
        .update({
          creditor: updatedDebt.creditor,
          description: updatedDebt.description,
          amount: updatedDebt.amount,
          installments: updatedDebt.installments,
          installment_value: updatedDebt.installmentValue,
          total_with_interest: updatedDebt.totalWithInterest,
          due_date: updatedDebt.dueDate,
          justification: updatedDebt.justification,
          additional_terms: updatedDebt.additionalTerms,
          status: updatedDebt.status
        })
        .eq('id', id);

      if (error) throw error;

      setDebts(prev => prev.map(debt => 
        debt.id === id ? { ...debt, ...updatedDebt } : debt
      ));
    } catch (error) {
      console.error('Erro ao atualizar dívida:', error);
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
      console.error('Erro ao deletar entrada de fluxo de caixa:', error);
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
      console.error('Erro ao deletar custo operacional:', error);
    }
  };

  const deleteDebt = async (id: string) => {
    try {
      const debtToDelete = debts.find(debt => debt.id === id);
      
      const { error } = await supabase
        .from('debts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDebts(prev => prev.filter(debt => debt.id !== id));
      
      // Remover o custo operacional relacionado se existir
      if (debtToDelete) {
        const relatedCost = operationalCosts.find(cost => 
          cost.description.includes(debtToDelete.creditor) && 
          cost.category === 'financial'
        );
        if (relatedCost) {
          await deleteOperationalCost(relatedCost.id);
        }
      }
    } catch (error) {
      console.error('Erro ao deletar dívida:', error);
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