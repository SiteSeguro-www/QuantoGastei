import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  X,
  ArrowUpDown,
  Tag,
  Plus,
} from 'lucide-react';
import { useFinance, getTodayString } from '../context/FinanceContext';
import { TransactionItem } from '../components/TransactionItem';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Transaction } from '../types/finance';

type DateFilterOption = 'all' | 'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'custom';
type TypeFilterOption = 'all' | 'expense' | 'income';

export const HistoryView: React.FC = () => {
  const {
    transactions,
    categories,
    exportDataCSV,
    formatCurrency,
    setIsAddModalOpen,
    setEditingTransaction,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('month');
  const [typeFilter, setTypeFilter] = useState<TypeFilterOption>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Delete modal state
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const todayStr = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  // Current month string 'YYYY-MM'
  const currentMonth = todayStr.substring(0, 7);

  // Last month string
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  // Week start calculation (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`;

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search query filter (matches category name, description, amount)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCategory = tx.categoryName.toLowerCase().includes(q);
        const matchesDesc = (tx.description || '').toLowerCase().includes(q);
        const matchesAmount = tx.amount.toString().includes(q);
        if (!matchesCategory && !matchesDesc && !matchesAmount) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Category filter
      if (selectedCategoryId !== 'all' && tx.categoryId !== selectedCategoryId) return false;

      // Date filter
      if (dateFilter === 'today') {
        if (tx.date !== todayStr) return false;
      } else if (dateFilter === 'yesterday') {
        if (tx.date !== yesterdayStr) return false;
      } else if (dateFilter === 'week') {
        if (tx.date < weekAgoStr || tx.date > todayStr) return false;
      } else if (dateFilter === 'month') {
        if (!tx.date.startsWith(currentMonth)) return false;
      } else if (dateFilter === 'last_month') {
        if (!tx.date.startsWith(lastMonth)) return false;
      } else if (dateFilter === 'custom') {
        if (customStartDate && tx.date < customStartDate) return false;
        if (customEndDate && tx.date > customEndDate) return false;
      }

      return true;
    });
  }, [
    transactions,
    searchQuery,
    typeFilter,
    selectedCategoryId,
    dateFilter,
    todayStr,
    yesterdayStr,
    weekAgoStr,
    currentMonth,
    lastMonth,
    customStartDate,
    customEndDate,
  ]);

  // Group filtered transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [date: string]: Transaction[] } = {};
    filteredTransactions.forEach((tx) => {
      if (!groups[tx.date]) {
        groups[tx.date] = [];
      }
      groups[tx.date].push(tx);
    });

    // Sort descending by date
    const sortedDates = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedDates.map((date) => ({
      date,
      transactions: groups[date].sort((a, b) => b.time.localeCompare(a.time)),
      totalExpense: groups[date]
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      totalIncome: groups[date]
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
    }));
  }, [filteredTransactions]);

  // Format date header friendly (HOJE, ONTEM, or formatted DD de Mês)
  const formatDateHeader = (dateStr: string) => {
    if (dateStr === todayStr) return 'HOJE';
    if (dateStr === yesterdayStr) return 'ONTEM';

    const [year, month, day] = dateStr.split('-');
    const months = [
      'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
      'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
    ];
    return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
  };

  const totalFilteredExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((a, b) => a + b.amount, 0);
  }, [filteredTransactions]);

  return (
    <div className="space-y-5 pb-24 md:pb-12">
      {/* Header and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Histórico de Gastos
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Acompanhe e pesquise todos os registros financeiros
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportDataCSV(dateFilter === 'month' ? 'month' : 'all')}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>
          <button
            onClick={() => {
              setEditingTransaction(null);
              setIsAddModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md shadow-emerald-950/30"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            Novo Registro
          </button>
        </div>
      </div>

      {/* Instant Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Pesquisar gastos (McDonald's, Mercado, Gasolina, Chocolate...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#121622] border border-white/[0.08] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Date Filter Horizontal Pills */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'month', label: 'Este mês' },
            { id: 'today', label: 'Hoje' },
            { id: 'yesterday', label: 'Ontem' },
            { id: 'week', label: 'Esta semana' },
            { id: 'last_month', label: 'Mês passado' },
            { id: 'all', label: 'Todos os registros' },
            { id: 'custom', label: 'Personalizado' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setDateFilter(item.id as DateFilterOption)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                dateFilter === item.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                  : 'bg-[#121622] text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Custom date range inputs when 'custom' selected */}
        {dateFilter === 'custom' && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#121622] border border-white/10 animate-in fade-in duration-150">
            <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
            <div className="flex items-center gap-2 text-xs flex-1">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-white focus:outline-none"
              />
              <span className="text-slate-500">até</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-white focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Secondary filters: Type & Category */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Type segmented control */}
            <div className="flex items-center p-1 rounded-xl bg-[#121622] border border-white/5 text-xs shrink-0">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg font-medium transition-all ${
                  typeFilter === 'all' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg font-medium transition-all ${
                  typeFilter === 'expense' ? 'bg-rose-500/20 text-rose-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Gastos
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg font-medium transition-all ${
                  typeFilter === 'income' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Receitas
              </button>
            </div>

            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#121622] border border-white/5 text-xs flex-1 sm:flex-initial min-w-0">
              <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="bg-transparent text-slate-200 outline-none cursor-pointer w-full truncate text-xs"
              >
                <option value="all" className="bg-slate-900 text-white">
                  Todas categorias
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.emoji ? `${c.emoji} ` : ''}{c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Summary Counter */}
          <div className="text-[11px] sm:text-xs text-slate-400 flex items-center justify-between sm:justify-end gap-1.5 px-1">
            <span>{filteredTransactions.length} registros</span>
            <span>·</span>
            <span className="font-mono-nums font-bold text-rose-400">
              Total: {formatCurrency(totalFilteredExpense)}
            </span>
          </div>
        </div>
      </div>

      {/* Grouped Transactions List */}
      {groupedTransactions.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#121622]/60 border border-white/5 text-center">
          <p className="text-sm font-semibold text-slate-300 mb-1">
            Nenhum registro encontrado
          </p>
          <p className="text-xs text-slate-500 mb-4">
            Tente mudar a pesquisa ou o período selecionado.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setDateFilter('all');
              setSelectedCategoryId('all');
              setTypeFilter('all');
            }}
            className="text-xs font-semibold text-emerald-400 hover:underline"
          >
            Limpar todos os filtros
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {groupedTransactions.map((group) => (
            <div key={group.date} className="space-y-2">
              {/* Date Group Header */}
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {formatDateHeader(group.date)}
                </span>
                <div className="flex items-center gap-2 text-xs font-mono-nums font-bold">
                  {group.totalExpense > 0 && (
                    <span className="text-rose-400">
                      − {formatCurrency(group.totalExpense)}
                    </span>
                  )}
                  {group.totalIncome > 0 && (
                    <span className="text-emerald-400">
                      + {formatCurrency(group.totalIncome)}
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions in this date */}
              <div className="space-y-2">
                {group.transactions.map((tx) => (
                  <TransactionItem
                    key={tx.id}
                    transaction={tx}
                    onOpenDelete={(t) => setTxToDelete(t)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        transaction={txToDelete}
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
      />
    </div>
  );
};
