import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { Category, FixedBill, MonthCycleInfo, Transaction, UserProfile, ViewTab } from '../types/finance';
import { DEFAULT_CATEGORIES, DEFAULT_PROFILES, INITIAL_FIXED_BILLS, INITIAL_TRANSACTIONS } from '../data/initialData';
import { calculateMonthCycle, isDateInCycle } from '../utils/cycleHelper';
import { getCacheStatus, loadFromCache, saveToCache } from '../utils/storageCache';

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
  addProfile: (name: string, monthlyIncomeGoal?: number, monthCycleStartDay?: number) => UserProfile;
  deleteProfile: (profileId: string) => boolean;
  transactions: Transaction[];
  categories: Category[];
  fixedBills: FixedBill[];
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: number) => void;

  // Month cycle configuration
  monthCycleStartDay: number;
  updateMonthCycleStartDay: (startDay: number) => void;
  cycleInfo: MonthCycleInfo;

  // Cache System
  cacheStatus: ReturnType<typeof getCacheStatus>;

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
  isAccountModalOpen: boolean;
  setIsAccountModalOpen: (open: boolean) => void;
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

// Route & tab mapping helpers
const TAB_ROUTES: Record<ViewTab, string> = {
  landing: '/inicio',
  dashboard: '/dashboard',
  history: '/historico',
  analytics: '/resumo',
  calendar: '/calendario',
  'fixed-bills': '/contas',
  categories: '/categorias',
  profile: '/perfil',
};

const getInitialTabFromLocation = (): ViewTab => {
  if (typeof window === 'undefined') return 'dashboard';
  const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(window.location.search);
  const tabParam = params.get('tab') as ViewTab | null;

  if (tabParam && ['landing', 'dashboard', 'history', 'analytics', 'calendar', 'fixed-bills', 'categories', 'profile'].includes(tabParam)) {
    return tabParam;
  }

  // Explicit route paths
  if (path === '/inicio' || path === '/landing') return 'landing';
  if (path === '/dashboard' || path === '/painel') return 'dashboard';
  if (path === '/history' || path === '/historico' || path === '/gastos') return 'history';
  if (path === '/analytics' || path === '/resumo' || path === '/receitas') return 'analytics';
  if (path === '/calendar' || path === '/calendario') return 'calendar';
  if (path === '/fixed-bills' || path === '/contas' || path === '/contas-fixas') return 'fixed-bills';
  if (path === '/categories' || path === '/categorias') return 'categories';
  if (path === '/profile' || path === '/perfil' || path === '/configuracoes' || path === '/aplicativo') return 'profile';

  // If entering via root path ('/'), check if user already has at least 1 account created
  try {
    const activeProfileId = localStorage.getItem('finan_active_profile_id');
    const storedProfiles = localStorage.getItem('finan_profiles');
    const parsedProfiles = storedProfiles ? JSON.parse(storedProfiles) : [];

    if (activeProfileId || (Array.isArray(parsedProfiles) && parsedProfiles.length > 0)) {
      // User has already created / has accounts -> go directly to dashboard
      return 'dashboard';
    }
  } catch {
    // fallback to dashboard if any error
    return 'dashboard';
  }

  // Brand new visitor with no profiles
  return 'landing';
};

const shouldOpenAddModalFromUrl = (): boolean => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('action') === 'add-expense' || params.get('action') === 'add';
};

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<ViewTab>(() => getInitialTabFromLocation());

  // Function to set active tab and update browser history URL smoothly
  const setActiveTab = (tab: ViewTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      const targetPath = TAB_ROUTES[tab] || '/dashboard';
      if (window.location.pathname !== targetPath) {
        window.history.pushState({ tab }, '', targetPath);
      }
    }
  };

  // Sync tab with browser popstate (back / forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getInitialTabFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
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

  const [monthCycleStartDay, setMonthCycleStartDay] = useState<number>(() => {
    const saved = localStorage.getItem(`finan_cycle_${activeProfileId}`);
    if (saved) {
      const num = parseInt(saved, 10);
      if (!isNaN(num) && num >= 1 && num <= 31) return num;
    }
    const prof = profiles.find((p) => p.id === activeProfileId);
    return prof?.monthCycleStartDay || 1;
  });

  // Sync profiles to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem('finan_profiles', JSON.stringify(profiles));
  }, [profiles]);

  // Keep monthCycleStartDay in sync when active profile changes
  useEffect(() => {
    const saved = localStorage.getItem(`finan_cycle_${activeProfileId}`);
    if (saved) {
      const num = parseInt(saved, 10);
      if (!isNaN(num) && num >= 1 && num <= 31) {
        setMonthCycleStartDay(num);
        return;
      }
    }
    const prof = profiles.find((p) => p.id === activeProfileId);
    setMonthCycleStartDay(prof?.monthCycleStartDay || 1);
  }, [activeProfileId, profiles]);

  const activeProfile = useMemo(() => {
    const p = profiles.find((p) => p.id === activeProfileId) || profiles[0];
    return { ...p, monthCycleStartDay };
  }, [profiles, activeProfileId, monthCycleStartDay]);

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
    // Only load initial demo transactions for the default demo profile if no saved data
    if (activeProfileId === DEFAULT_PROFILES[0].id) {
      return INITIAL_TRANSACTIONS.map((tx) => ({ ...tx, profileId: activeProfileId }));
    }
    return [];
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
        return parsed;
      } catch {
        // fallback
      }
    }
    // Only load initial demo bills for the default demo profile
    if (activeProfileId === DEFAULT_PROFILES[0].id) {
      return INITIAL_FIXED_BILLS.map((b) => ({ ...b, profileId: activeProfileId }));
    }
    return [];
  });

  // UI state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(() => shouldOpenAddModalFromUrl());
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [presetPreload, setPresetPreload] = useState<{ categoryId?: string; amount?: number; description?: string } | null>(null);

  // Sync to localStorage and cache whenever transactions change
  useEffect(() => {
    saveToCache(`finan_tx_${activeProfileId}`, transactions);
  }, [transactions, activeProfileId]);

  // Sync categories
  useEffect(() => {
    saveToCache(`finan_cats_${activeProfileId}`, categories);
  }, [categories, activeProfileId]);

  // Sync fixed bills
  useEffect(() => {
    saveToCache(`finan_bills_${activeProfileId}`, fixedBills);
  }, [fixedBills, activeProfileId]);

  // Cache Status
  const [cacheStatus, setCacheStatus] = useState(() => getCacheStatus());
  useEffect(() => {
    setCacheStatus(getCacheStatus());
  }, [transactions, categories, fixedBills, profiles, activeProfileId]);

  // Switch profile handler
  const switchProfile = (profileId: string) => {
    setActiveProfileId(profileId);
    saveToCache('finan_active_profile_id', profileId);

    // Load data for new profile
    const savedTx = localStorage.getItem(`finan_tx_${profileId}`);
    if (savedTx) {
      try {
        setTransactions(JSON.parse(savedTx));
      } catch {
        setTransactions([]);
      }
    } else {
      if (profileId === DEFAULT_PROFILES[0].id) {
        setTransactions(INITIAL_TRANSACTIONS.map((tx) => ({ ...tx, profileId })));
      } else {
        setTransactions([]);
      }
    }

    const savedCats = localStorage.getItem(`finan_cats_${profileId}`);
    if (savedCats) {
      try {
        const parsed: Category[] = JSON.parse(savedCats);
        const existingIds = new Set(parsed.map((c) => c.id));
        const missingDefaults = DEFAULT_CATEGORIES.filter((c) => !existingIds.has(c.id));
        setCategories([...parsed, ...missingDefaults]);
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
      if (profileId === DEFAULT_PROFILES[0].id) {
        setFixedBills(INITIAL_FIXED_BILLS.map((b) => ({ ...b, profileId })));
      } else {
        setFixedBills([]);
      }
    }

    showToast(`Perfil alterado para ${profiles.find((p) => p.id === profileId)?.name || 'Perfil'}`, 'info');
  };

  // Add new profile / account
  const addProfile = (name: string, monthlyIncomeGoal: number = 0, monthCycleStartDay: number = 1): UserProfile => {
    const trimmed = name.trim();
    const newProfileId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const parsedIncome = Number(monthlyIncomeGoal) || 0;
    const parsedCycleDay = Math.max(1, Math.min(31, Number(monthCycleStartDay) || 1));

    const newProfile: UserProfile = {
      id: newProfileId,
      name: trimmed,
      email: `${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '')}@quantogastei.app`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      currency: 'BRL',
      monthlyIncomeGoal: parsedIncome,
      monthCycleStartDay: parsedCycleDay,
    };

    // If an initial monthly income was specified, register it directly as an income entry
    const initialTxs: Transaction[] = [];
    if (parsedIncome > 0) {
      initialTxs.push({
        id: `tx_${Date.now()}_income`,
        profileId: newProfileId,
        type: 'income',
        amount: parsedIncome,
        categoryId: 'salario',
        categoryName: 'Salário / Renda',
        categoryIcon: 'Coins',
        categoryColor: '#10B981',
        description: 'Renda Mensal informada',
        date: getTodayString(),
        time: getCurrentTimeString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Save completely clean state for this new account in local storage
    saveToCache(`finan_tx_${newProfileId}`, initialTxs);
    saveToCache(`finan_bills_${newProfileId}`, []);
    saveToCache(`finan_cats_${newProfileId}`, DEFAULT_CATEGORIES);
    saveToCache('finan_active_profile_id', newProfileId);

    // Update state directly
    setProfiles((prev) => {
      const updated = [...prev, newProfile];
      saveToCache('finan_profiles', updated);
      return updated;
    });

    setActiveProfileId(newProfileId);
    setTransactions(initialTxs);
    setFixedBills([]);
    setCategories(DEFAULT_CATEGORIES);

    showToast(
      parsedIncome > 0
        ? `✓ Conta "${trimmed}" criada com R$ ${parsedIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de renda e dados limpos!`
        : `✓ Conta "${trimmed}" criada com dados limpos!`,
      'success'
    );
    return newProfile;
  };

  // Update Month Cycle Start Day for current active profile
  const updateMonthCycleStartDay = (startDay: number) => {
    const safeDay = Math.max(1, Math.min(31, Math.floor(startDay || 1)));
    
    // 1. Update state immediately
    setMonthCycleStartDay(safeDay);

    // 2. Persist per-profile key
    saveToCache(`finan_cycle_${activeProfileId}`, safeDay);
    localStorage.setItem(`finan_cycle_${activeProfileId}`, String(safeDay));

    // 3. Update profiles array
    setProfiles((prev) => {
      const updated = prev.map((p) => (p.id === activeProfileId ? { ...p, monthCycleStartDay: safeDay } : p));
      saveToCache('finan_profiles', updated);
      localStorage.setItem('finan_profiles', JSON.stringify(updated));
      return updated;
    });

    showToast(
      safeDay === 1
        ? `✓ Ciclo do mês redefinido para o Mês Calendário (dia 1 ao final do mês)`
        : `✓ Ciclo do mês alterado: Inicia todo dia ${safeDay}`,
      'success'
    );
  };

  // Delete profile / account
  const deleteProfile = (profileId: string): boolean => {
    if (profiles.length <= 1) {
      showToast('Você não pode excluir a única conta restante.', 'error');
      return false;
    }

    const profileToDelete = profiles.find((p) => p.id === profileId);
    const newProfiles = profiles.filter((p) => p.id !== profileId);
    setProfiles(newProfiles);

    // Clean up profile storage data
    localStorage.removeItem(`finan_tx_${profileId}`);
    localStorage.removeItem(`finan_cats_${profileId}`);
    localStorage.removeItem(`finan_bills_${profileId}`);

    // If active profile was deleted, switch to first remaining profile
    if (activeProfileId === profileId) {
      const nextProfile = newProfiles[0];
      switchProfile(nextProfile.id);
    }

    showToast(`✓ Conta "${profileToDelete?.name || 'Usuário'}" excluída.`, 'info');
    return true;
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

  // Calculated Month Cycle Boundaries
  const cycleInfo = useMemo(() => {
    return calculateMonthCycle(monthCycleStartDay);
  }, [monthCycleStartDay]);

  // Calculated Metrics
  const todayStr = useMemo(() => getTodayString(), []);

  const todayExpenses = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'expense' && tx.date === todayStr && tx.profileId === activeProfileId)
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions, todayStr, activeProfileId]);

  const monthExpenses = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'expense' && isDateInCycle(tx.date, cycleInfo) && tx.profileId === activeProfileId)
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions, cycleInfo, activeProfileId]);

  const monthIncome = useMemo(() => {
    return transactions
      .filter((tx) => tx.type === 'income' && isDateInCycle(tx.date, cycleInfo) && tx.profileId === activeProfileId)
      .reduce((acc, tx) => acc + tx.amount, 0);
  }, [transactions, cycleInfo, activeProfileId]);

  const totalFixedBillsAmount = useMemo(() => {
    return fixedBills
      .filter((b) => b.profileId === activeProfileId)
      .reduce((acc, b) => acc + b.amount, 0);
  }, [fixedBills, activeProfileId]);

  // Balance = Month Income - Month Expenses (or if no income logged, based on income goal or real net)
  const availableBalance = useMemo(() => {
    const base = monthIncome > 0 ? monthIncome : (activeProfile?.monthlyIncomeGoal || 0);
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
      list = list.filter((t) => isDateInCycle(t.date, cycleInfo));
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
        addProfile,
        deleteProfile,
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
        monthCycleStartDay,
        updateMonthCycleStartDay,
        cycleInfo,
        cacheStatus,
        todayExpenses,
        monthExpenses,
        monthIncome,
        availableBalance,
        totalFixedBillsAmount,
        upcomingBills,
        isAddModalOpen,
        setIsAddModalOpen,
        isAccountModalOpen,
        setIsAccountModalOpen,
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
