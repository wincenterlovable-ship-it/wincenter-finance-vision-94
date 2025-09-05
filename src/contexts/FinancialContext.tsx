import React, { createContext, useContext, useState, ReactNode } from 'react';

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

  const addCashFlowEntry = (entry: Omit<CashFlowEntry, 'id'>) => {
    const newEntry = { ...entry, id: Date.now().toString() };
    setCashFlowEntries(prev => [...prev, newEntry]);
  };

  const addOperationalCost = (cost: Omit<OperationalCost, 'id'>) => {
    const newCost = { ...cost, id: Date.now().toString() };
    setOperationalCosts(prev => [...prev, newCost]);
  };

  const addDebt = (debt: Omit<Debt, 'id'>) => {
    const newDebt = { ...debt, id: Date.now().toString() };
    setDebts(prev => [...prev, newDebt]);
    
    // Automaticamente adicionar a parcela como custo operacional fixo
    if (newDebt.installmentValue > 0) {
      const installmentCost = {
        id: `debt-${newDebt.id}`,
        description: `Parcela - ${newDebt.creditor}`,
        type: 'fixo' as const,
        amount: newDebt.installmentValue,
        date: newDebt.dueDate,
        category: 'financial'
      };
      setOperationalCosts(prev => [...prev, installmentCost]);
    }
  };

  const updateCashFlowEntry = (id: string, updatedEntry: Partial<CashFlowEntry>) => {
    setCashFlowEntries(prev => prev.map(entry => 
      entry.id === id ? { ...entry, ...updatedEntry } : entry
    ));
  };

  const updateOperationalCost = (id: string, updatedCost: Partial<OperationalCost>) => {
    setOperationalCosts(prev => prev.map(cost => 
      cost.id === id ? { ...cost, ...updatedCost } : cost
    ));
  };

  const updateDebt = (id: string, updatedDebt: Partial<Debt>) => {
    setDebts(prev => prev.map(debt => 
      debt.id === id ? { ...debt, ...updatedDebt } : debt
    ));
  };

  const deleteCashFlowEntry = (id: string) => {
    setCashFlowEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const deleteOperationalCost = (id: string) => {
    setOperationalCosts(prev => prev.filter(cost => cost.id !== id));
  };

  const deleteDebt = (id: string) => {
    const debtToDelete = debts.find(debt => debt.id === id);
    setDebts(prev => prev.filter(debt => debt.id !== id));
    
    // Remover o custo operacional relacionado se existir
    if (debtToDelete) {
      setOperationalCosts(prev => prev.filter(cost => cost.id !== `debt-${id}`));
    }
  };

  const getTotalRevenue = () => {
    return cashFlowEntries
      .filter(entry => entry.type === 'entrada')
      .reduce((total, entry) => total + entry.amount, 0);
  };

  const getTotalExpenses = () => {
    return cashFlowEntries
      .filter(entry => entry.type === 'saida')
      .reduce((total, entry) => total + entry.amount, 0);
  };

  const getTotalDebts = () => {
    return debts.reduce((total, debt) => total + debt.amount, 0);
  };

  const getTotalOperationalCosts = () => {
    return operationalCosts.reduce((total, cost) => total + cost.amount, 0);
  };

  const getNetCashFlow = () => {
    return getTotalRevenue() - getTotalExpenses();
  };

  const value: FinancialContextType = {
    cashFlowEntries,
    operationalCosts,
    debts,
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
  };

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  );
};