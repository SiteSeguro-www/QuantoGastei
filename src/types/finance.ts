export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name or emoji
  emoji?: string;
  color: string; // HEX color
  type: 'expense' | 'income' | 'both';
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  createdAt: string;
  updatedAt: string;
  profileId: string;
}

export interface FixedBill {
  id: string;
  name: string;
  amount: number;
  dueDay: number; // 1-31
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  isPaidThisMonth: boolean;
  lastPaidDate?: string;
  profileId: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  currency: 'BRL' | 'USD' | 'EUR';
  monthlyIncomeGoal: number;
}

export type ViewTab = 'dashboard' | 'history' | 'analytics' | 'calendar' | 'fixed-bills' | 'categories' | 'profile';
