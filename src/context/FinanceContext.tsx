import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Category, FixedBill, Transaction, UserProfile, ViewTab } from '../types/finance';
import { DEFAULT_CATEGORIES, DEFAULT_PROFILES, INITIAL_FIXED_BILLS, INITIAL_TRANSACTIONS } from '../data/initialData';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface FinanceContextType {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  activeProfile: UserProfile;
  profiles: UserProfile[];
  switchProfile: (profileId: string) => void;
  transactions: Transaction[];
  categories: Category[];
  fixedBills: FixedBill[];
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: number) => void;

  // Actions
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'profileId'>) => void;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'profileId'>>) => void;
  deleteTransaction: (id: string) => void;
  quickAdjustAmount: (id: string, delta: number) => void;

  // Categories
  addCategory: (cat: Omit<Category, 'id' | 'isCustom'>) => Category;
  deleteCategory: (id: string) => void;

  // Fixed Bills
  addFixedBill: (bill: Omit<FixedBill, 'id' | 'profileId' | 'isPaidThisMonth'>) => void;
  updateFixedBill: (id: string, bill: Partial<FixedBill>) => void;
  deleteFixedBill: (id: string) => void;
  toggleBillPaid: (id: string, createExpenseRecord?: boolean) => void;

  // Metrics
  todayExpenses: number;
  monthExpenses: number;
  monthIncome: number;
  availableBalance: number;
  totalFixedBillsAmount: number;
  upcomingBills: (FixedBill & { daysUntilDue: number; statusText: string })[];

  // Quick action modal triggers
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  editingTransaction: Transaction | null;
  setEditingTransaction: (tx: Transaction | null) => void;
  presetPreload: { categoryId?: string; amount?: number; description?: string } | null;
  setPresetPreload: (preset: { categoryId?: string; amount?: number; description?: string } | null) => void;

  // Export / Reset
  exportDataCSV: (period?: string) => void;
  exportDataJSON: () => void;
  importDataJSON: (jsonString: string) => boolean;
  resetToDefaults: () => void;

  // Formatting helpers
  formatCurrency: (amount: number) => string;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Helper to get today string in local format YYYY-MM-DD
export const getTodayString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getCurrentTimeString = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [profiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('finan_profiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    return localStorage.getItem('finan_active_profile_id') || DEFAULT_PROFILES[0].id;
  });

  const activeProfile = useMemo(() => {
    return profiles.find((p) => p.id === activeProfileId) || profiles[0];
  }, [profiles, activeProfileId]);

  // Load transactions for active profile
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(`finan_tx_${activeProfileId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_TRANSACTIONS.map((tx) => ({ ...tx, profileId: activeProfileId }));
  });

  // Load categories
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(`finan_cats_${activeProfileId}`);
    if (saved) {
      try {
        const parsed: Category[] = JSON.parse(saved);
        // Merge any new default categories that might not exist yet in local storage
        const existingIds = new Set(parsed.map((c) => c.id));
        const missingDefaults = DEFAULT_CATEGORIES.filter((c) => !existingIds.has(c.id));
        return [...parsed, ...missingDefaults];
      } catch {
        // fallback
      }
    }
    return DEFAULT_CATEGORIES;
  });

  // Load fixed bills
  const [fixedBills, setFixedBills] = useState<FixedBill[]>(() => {
    const saved = localStorage.getItem(`finan_bills_${activeProfileId}`);
    if (saved) {
      try {
        const parsed: FixedBill[] = JSON.parse(saved);
        // Ensure essential bills (agua, luz, telefone, internet, tv_cabo) are present
        const existingIds = new Set(parsed.map((b) => b.id));
        const missingDefaults = INITIAL_FIXED_BILLS
          .filter((b) => !existingIds.has(b.id))
          .map((b) => ({ ...b, profileId: activeProfileId }));
        return [...parsed, ...missingDefaults];
      } catch {
        // fallback
      }
    }
    return INITIAL_FIXED_BILLS.map((b) => ({ ...b, profileId: activeProfileId }));
  });

  // UI state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [presetPreload, setPresetPreload] = useState<{ categoryId?: string; amount?: number; description?: string } | null>(null);

  // Sync to localStorage whenever transactions change
  useEffect(() => {
    localStorage.setItem(`finan_tx_${activeProfileId}`, JSON.stringify(transactions));
  }, [transactions, activeProfileId]);

  // Sync categories
  useEffect(() => {
    localStorage.setItem(`finan_cats_${activeProfileId}`, JSON.stringify(categories));
  }, [categories, activeProfileId]);

  // Sync fixed bills
  useEffect(() => {
    localStorage.setItem(`finan_bills_${activeProfileId}`, JSON.stringify(fixedBills));
  }, [fixedBills, activeProfileId]);

  // Switch profile handler
  const switchProfile = (profileId: string) => {
    setActiveProfileId(profileId);
    localStorage.setItem('finan_active_profile_id', profileId);

    // Load data for new profile
    const savedTx = localStorage.getItem(`finan_tx_${profileId}`);
    if (savedTx) {
      try {
        setTransactions(JSON.parse(savedTx));
      } catch {
        setTransactions([]);
      }
    } else {
      setTransactions(INITIAL_TRANSACTIONS.map((tx) => ({ ...tx, profileId })));
    }

    const savedCats = localStorage.getItem(`finan_cats_${profileId}`);
    if (savedCats) {
      try {
        setCategories(JSON.parse(savedCats));
      } catch {
        setCategories(DEFAULT_CATEGORIES);
      }
    } else {
      setCategories(DEFAULT_CATEGORIES);
    }

    const savedBills = localStorage.getItem(`finan_bills_${profileId}`);
    if (savedBills) {
      try {
        setFixedBills(JSON.parse(savedBills));
      } catch {
        setFixedBills([]);
      }
    } else {
      setFixedBills(INITIAL_FIXED_BILLS.map((b) => ({ ...b, profileId })));
    }

    showToast(`Perfil alterado para ${profiles.find((p) => p.id === profileId)?.name || 'Perfil'}`, 'info');
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const formatCurrency = (val: number): string => {
    const curr = activeProfile?.currency || 'BRL';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
    }).format(val);
  };

  // Add transaction
  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'profileId'>) => {
    const newTx: Transaction = {
      ...data,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profileId: activeProfileId,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(data.type === 'expense' ? '✓ Gasto adicionado' : '✓ Receita adicionada', 'success');
  };

  // Update transaction
  const updateTransaction = (id: string, data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'profileId'>>) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id && tx.profileId === activeProfileId) {
          return {
            ...tx,
            ...data,
            updatedAt: new Date().toISOString(),
          };
        }
        return tx;
      })
    );
    showToast('✓ Registro atualizado com sucesso', 'success');
  };

  // Delete transaction with ownership check
  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((tx) => !(tx.id === id && tx.profileId === activeProfileId)));
    showToast('✓ Gasto removido', 'info');
  };

  // Quick adjust amount (+/- 1, +/- 5, etc.)
  const quickAdjustAmount = (id: string, delta: number) => {
    setTransactions((prev) =>
      prev.map((tx) => {
        if (tx.id === id && tx.profileId === activeProfileId) {
          const newAmount = Math.max(0.1, Math.round((tx.amount + delta) * 100) / 100);
          return {
            ...tx,
            amount: newAmount,
            updatedAt: new Date().toISOString(),
          };
        }
        return tx;
      })
    );
    const sign = delta > 0 ? `+${delta.toFixed(2)}` : `${delta.toFixed(2)}`;
    showToast(`Valor ajustado: ${sign}`, 'info');
  };

  // Add category
  const addCategory = (cat: Omit<Category, 'id' | 'isCustom'>): Category => {
    const newCat: Category = {
      ...cat,
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      isCustom: true,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`✓ Categoria "${cat.name}" criada`, 'success');
    return newCat;
  };

  // Delete category
  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Categoria removida', 'info');
  };

  // Fixed bills
  const addFixedBill = (bill: Omit<FixedBill, 'id' | 'profileId' | 'isPaidThisMonth'>) => {
    const newBill: FixedBill = {
      ...bill,
      id: `bill_${Date.now()}`,
      isPaidThisMonth: false,
      profileId: activeProfileId,
    };
    setFixedBills((prev) => [...prev, newBill]);
    showToast(`✓ Conta "${bill.name}" cadastrada`, 'success');
  };

  const updateFixedBill = (id: string, bill: Partial<FixedBill>) => {
    setFixedBills((prev) =>
      prev.map((b) => (b.id === id && b.profileId === activeProfileId ? { ...b, ...bill } : b))
    );
    showToast('Conta fixa atualizada', 'success');
  };

  const deleteFixedBill = (id: string) => {
    setFixedBills((prev) => prev.filter((b) => !(b.id === id && b.profileId === activeProfileId)));
    showToast('Conta fixa removida', 'info');
  };

  const toggleBillPaid = (id: string, createExpenseRecord = true) => {
    const bill = fixedBills.find((b) => b.id === id && b.profileId === activeProfileId);
    if (!bill) return;

    const willBePaid = !bill.isPaidThisMonth;

    setFixedBills((prev) =>
      prev.map((b) =>
        b.id === id && b.profileId === activeProfileId
          ? {
              ...b,
              isPaidThisMonth: willBePaid,
              lastPaidDate: willBePaid ? getTodayString() : b.lastPaidDate,
            }
          : b
      )
    );

    if (willBePaid && createExpenseRecord) {
      addTransaction({
        type: 'expense',
        amount: bill.amount,
        categoryId: bill.categoryId,
        categoryName: bill.categoryName,
        categoryIcon: bill.categoryIcon,
        categoryColor: bill.categoryColor,
        description: `Conta fixa paga: ${bill.name}`,
        date: getTodayString(),
        time: getCurrentTimeString(),
      });
      showToast(`✓ "${bill.name}" paga e registrada nos gastos!`, 'success');
    } else {
      showToast(willBePaid ? `✓ "${bill.name}" marcada como paga` : `"${bill.name}" desmarcada como paga`, 'info');
    }
  };

  // Calculated Metrics
  const todayStr = useMemo(() => getTodayString(), []);
  const currentMonthYear = useMemo(() => todayStr.substring(0, 7), [todayStr]);

  const todayExpenses = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'expense' && tx.date === todayStr && tx.profileId === activeProfileId)
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions, todayStr, activeProfileId]);

  const monthExpenses = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'expense' && tx.date.startsWith(currentMonthYear) && tx.profileId === activeProfileId)
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions, currentMonthYear, activeProfileId]);

  const monthIncome = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'income' && tx.date.startsWith(currentMonthYear) && tx.profileId === activeProfileId)
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions, currentMonthYear, activeProfileId]);

  const totalFixedBillsAmount = useMemo(() => {
    return fixedBills
      .filter((b) => b.profileId === activeProfileId)
      .reduce((acc, b) => acc + b.amount, 0);
  }, [fixedBills, activeProfileId]);

  // Balance = Month Income - Month Expenses (or if no income logged, based on income goal or real net)
  const availableBalance = useMemo(() => {
    const base = monthIncome > 0 ? monthIncome : (activeProfile?.monthlyIncomeGoal || 4500);
    return base - monthExpenses;
  }, [monthIncome, monthExpenses, activeProfile]);

  // Upcoming bills
  const upcomingBills = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDate();

    return fixedBills
      .filter((b) => b.profileId === activeProfileId && !b.isPaidThisMonth)
      .map((b) => {
        let diff = b.dueDay - currentDay;
        let statusText = '';
        if (diff === 0) {
          statusText = 'Vence hoje!';
        } else if (diff === 1) {
          statusText = 'Vence amanhã';
        } else if (diff > 1) {
          statusText = `Vence em ${diff} dias`;
        } else {
          statusText = `Atrasada (${Math.abs(diff)} dias)`;
        }
        return {
          ...b,
          daysUntilDue: diff,
          statusText,
        };
      })
      .sort((a, b) => a.dueDay - b.dueDay);
  }, [fixedBills, activeProfileId]);

  // Export CSV
  const exportDataCSV = (period = 'all') => {
    let list = transactions.filter((t) => t.profileId === activeProfileId);
    if (period === 'month') {
      list = list.filter((t) => t.date.startsWith(currentMonthYear));
    }

    const headers = ['ID', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)', 'Data', 'Hora'];
    const rows = list.map((t) => [
      t.id,
      t.type === 'expense' ? 'Gasto' : 'Receita',
      `"${t.categoryName}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.amount.toFixed(2),
      t.date,
      t.time,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `meu_financeiro_${period}_${getTodayString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Exportação CSV concluída com sucesso', 'success');
  };

  // Export JSON
  const exportDataJSON = () => {
    const backup = {
      profile: activeProfile,
      transactions: transactions.filter((t) => t.profileId === activeProfileId),
      categories,
      fixedBills: fixedBills.filter((b) => b.profileId === activeProfileId),
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `backup_meu_financeiro_${getTodayString()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('✓ Backup JSON gerado com sucesso', 'success');
  };

  // Import JSON
  const importDataJSON = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
        if (Array.isArray(data.categories)) setCategories(data.categories);
        if (Array.isArray(data.fixedBills)) setFixedBills(data.fixedBills);
        showToast('✓ Dados restaurados com sucesso!', 'success');
        return true;
      }
      showToast('Arquivo JSON inválido', 'error');
      return false;
    } catch {
      showToast('Erro ao importar JSON', 'error');
      return false;
    }
  };

  // Reset demo
  const resetToDefaults = () => {
    setTransactions(INITIAL_TRANSACTIONS.map((tx) => ({ ...tx, profileId: activeProfileId })));
    setCategories(DEFAULT_CATEGORIES);
    setFixedBills(INITIAL_FIXED_BILLS.map((b) => ({ ...b, profileId: activeProfileId })));
    showToast('✓ Dados restaurados para demonstração inicial', 'info');
  };

  return (
    <FinanceContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeProfile,
        profiles,
        switchProfile,
        transactions,
        categories,
        fixedBills,
        toasts,
        showToast,
        removeToast,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        quickAdjustAmount,
        addCategory,
        deleteCategory,
        addFixedBill,
        updateFixedBill,
        deleteFixedBill,
        toggleBillPaid,
        todayExpenses,
        monthExpenses,
        monthIncome,
        availableBalance,
        totalFixedBillsAmount,
        upcomingBills,
        isAddModalOpen,
        setIsAddModalOpen,
        editingTransaction,
        setEditingTransaction,
        presetPreload,
        setPresetPreload,
        exportDataCSV,
        exportDataJSON,
        importDataJSON,
        resetToDefaults,
        formatCurrency,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
