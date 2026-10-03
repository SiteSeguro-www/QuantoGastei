import React, { useState, useMemo } from 'react';
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Sparkles,
  Calendar,
  CreditCard,
  PieChart,
  Clock,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  Zap,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useFinance, getTodayString } from '../context/FinanceContext';
import { QUICK_PRESETS } from '../data/initialData';
import { TransactionItem } from '../components/TransactionItem';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Transaction } from '../types/finance';
import { CategoryIcon } from '../components/CategoryIcon';
import { MonthCycleModal } from '../components/MonthCycleModal';

export const ModernBentoDashboardView: React.FC = () => {
  const {
    activeProfile,
    todayExpenses,
    monthExpenses,
    monthIncome,
    availableBalance,
    totalFixedBillsAmount,
    upcomingBills,
    transactions,
    categories,
    cycleInfo,
    layoutMode,
    setLayoutMode,
    toggleLayoutMode,
    setIsAddModalOpen,
    setEditingTransaction,
    setPresetPreload,
    setActiveTab,
    toggleBillPaid,
    deleteTransaction,
    formatCurrency,
  } = useFinance();

  // State
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);
  const [isMonthCycleModalOpen, setIsMonthCycleModalOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'yesterday'>('all');

  const todayStr = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const handleOpenAddExpense = () => {
    setEditingTransaction(null);
    setPresetPreload(null);
    setIsAddModalOpen(true);
  };

  const handleQuickPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setEditingTransaction(null);
    setPresetPreload({
      categoryId: preset.categoryId,
      amount: preset.amount,
      description: preset.name,
    });
    setIsAddModalOpen(true);
  };

  // Filtered transactions for feed
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Time filter
      if (timeFilter === 'today' && tx.date !== todayStr) return false;
      if (timeFilter === 'yesterday' && tx.date !== yesterdayStr) return false;

      // Text search
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchesCategory = tx.categoryName.toLowerCase().includes(query);
        const matchesDesc = (tx.description || '').toLowerCase().includes(query);
        return matchesCategory || matchesDesc;
      }
      return true;
    });
  }, [transactions, timeFilter, searchFilter, todayStr, yesterdayStr]);

  // Category breakdown for integrated dashboard donut chart
  const categoryBreakdown = useMemo(() => {
    const expenseTxs = transactions.filter((t) => t.type === 'expense');
    const totalExp = expenseTxs.reduce((acc, t) => acc + t.amount, 0);
    const categoryColorMap = new Map(categories.map((c) => [c.id, c.color]));

    const map: { [id: string]: { name: string; icon: string; color: string; amount: number } } = {};
    expenseTxs.forEach((tx) => {
      const color = categoryColorMap.get(tx.categoryId) || tx.categoryColor || '#71717A';
      if (!map[tx.categoryId]) {
        map[tx.categoryId] = {
          name: tx.categoryName,
          icon: tx.categoryIcon,
          color,
          amount: 0,
        };
      }
      map[tx.categoryId].amount += tx.amount;
    });

    return Object.entries(map)
      .map(([id, val]) => ({
        id,
        ...val,
        percentage: totalExp > 0 ? (val.amount / totalExp) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, categories]);

  // Donut SVG arcs calculation
  const donutSegments = useMemo(() => {
    let cumulativeAngle = 0;
    const radius = 54;
    const center = 70;

    return categoryBreakdown.slice(0, 6).map((cat) => {
      const angle = (cat.percentage / 100) * 360;
      const startAngle = cumulativeAngle;
      cumulativeAngle += angle;

      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((startAngle + angle - 90) * Math.PI) / 180;

      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      const largeArcFlag = angle > 180 ? 1 : 0;
      const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

      return {
        ...cat,
        d,
      };
    });
  }, [categoryBreakdown]);

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-7xl mx-auto animate-in fade-in duration-200">
      {/* Top Banner: Layout Switcher & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-500/30">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-white">
                Layout Executivo Bento
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 uppercase tracking-wider">
                Novo Modelo
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Formato em grid executivo com master wallet, botões em pílula e widgets integrados
            </p>
          </div>
        </div>

        <button
          onClick={toggleLayoutMode}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 flex items-center gap-2 transition-all active:scale-95 shadow-sm"
        >
          <span>Trocar para Layout Clássico</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hero: Master Wallet Bento Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#131B2A] via-[#101622] to-[#0A0E18] border border-white/10 p-5 sm:p-8 shadow-2xl">
        {/* Glow ambient background effects */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Saldo Principal */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25">
                Master Wallet · Saldo Livre
              </span>
              <button
                onClick={() => setIsMonthCycleModalOpen(true)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg bg-white/5 border border-white/5"
              >
                <Calendar className="w-3 h-3 text-teal-400" />
                <span>Ciclo: Dia {cycleInfo.startDay}</span>
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-5xl lg:text-6xl font-black font-mono-nums tracking-tight text-white">
                {formatCurrency(availableBalance)}
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Economia real calculada para o ciclo ativo ({cycleInfo.cycleLabel})
            </p>
          </div>

          {/* Right: Dual Stat Capsules & Direct Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Income Capsule */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3 min-w-[170px]">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/30">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Entradas do Ciclo
                </span>
                <span className="text-sm sm:text-base font-extrabold font-mono-nums text-teal-300 block">
                  +{formatCurrency(monthIncome)}
                </span>
              </div>
            </div>

            {/* Expense Capsule */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3 min-w-[170px]">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Gastos do Ciclo
                </span>
                <span className="text-sm sm:text-base font-extrabold font-mono-nums text-rose-400 block">
                  -{formatCurrency(monthExpenses)}
                </span>
              </div>
            </div>

            {/* Prominent Action Button inside Master Card */}
            <button
              onClick={handleOpenAddExpense}
              className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
              <span>+ Adicionar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bento Quick Presets Bar (Pills Chips) */}
      <div className="p-4 rounded-3xl bg-[#121622]/90 border border-white/[0.07] space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Lançamento Rápido em 1 Toque (Chips Rápidos)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Clique para registrar</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleQuickPreset(preset)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/40 hover:bg-white/10 border border-white/5 hover:border-emerald-500/40 text-left transition-all shrink-0 active:scale-95 group"
            >
              <span className="text-base">{preset.emoji}</span>
              <div>
                <span className="text-xs font-semibold text-white group-hover:text-emerald-300 block leading-tight">
                  {preset.name}
                </span>
                <span className="text-[10.5px] font-bold font-mono text-rose-400">
                  R$ {preset.amount.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Split Bento 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Feed de Gastos & Histórico Inteligente */}
        <div className="lg:col-span-7 space-y-4">
          {/* Feed Header & Filters */}
          <div className="p-4 rounded-3xl bg-[#121622]/90 border border-white/[0.07] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Feed de Lançamentos Recentes
                </h3>
              </div>

              {/* Time Filter Pills */}
              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/30 p-1 rounded-xl border border-white/5">
                <button
                  onClick={() => setTimeFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    timeFilter === 'all'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setTimeFilter('today')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    timeFilter === 'today'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Hoje
                </button>
                <button
                  onClick={() => setTimeFilter('yesterday')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    timeFilter === 'yesterday'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Ontem
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filtrar por categoria ou descrição..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-2.5">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 rounded-3xl bg-[#121622]/50 border border-dashed border-white/10 text-center">
                <p className="text-xs text-slate-400 mb-2">
                  Nenhum lançamento encontrado para os filtros selecionados.
                </p>
                <button
                  onClick={handleOpenAddExpense}
                  className="text-xs font-bold text-emerald-400 hover:underline"
                >
                  + Registrar lançamento agora
                </button>
              </div>
            ) : (
              filteredTransactions.slice(0, 10).map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onOpenDelete={(t) => setTxToDelete(t)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Bento Widgets Integrados */}
        <div className="lg:col-span-5 space-y-4">
          {/* Widget 1: Donut Chart de Categorias Direto no Dashboard */}
          <div className="p-5 rounded-3xl bg-[#121622]/90 border border-white/[0.07] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Gastos por Categoria
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                className="text-xs font-semibold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Ver completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Nenhum gasto registrado ainda.</p>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* SVG Mini Donut */}
                <div className="relative w-32 h-32 shrink-0">
                  <svg viewBox="0 0 140 140" className="w-full h-full transform -rotate-90">
                    {donutSegments.map((segment) => (
                      <path
                        key={segment.id}
                        d={segment.d}
                        fill="none"
                        stroke={segment.color}
                        strokeWidth="16"
                        strokeLinecap="round"
                      />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] uppercase font-bold text-slate-500">Total</span>
                    <span className="text-[11px] font-extrabold font-mono text-white">
                      {formatCurrency(monthExpenses)}
                    </span>
                  </div>
                </div>

                {/* Top 4 Categories List */}
                <div className="flex-1 w-full space-y-2">
                  {categoryBreakdown.slice(0, 4).map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-xs gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-white font-medium truncate">{c.name}</span>
                      </div>
                      <span className="font-mono-nums font-bold text-rose-400 shrink-0">
                        {formatCurrency(c.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Widget 2: Contas Fixas & Vencimentos */}
          <div className="p-5 rounded-3xl bg-[#121622]/90 border border-white/[0.07] space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Próximas Contas a Pagar
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('fixed-bills')}
                className="text-xs font-semibold text-sky-400 hover:underline flex items-center gap-1"
              >
                <span>Ver todas ({upcomingBills.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingBills.length === 0 ? (
              <div className="p-4 rounded-2xl bg-black/20 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs text-slate-300 font-semibold">Tudo pago por aqui!</p>
                <p className="text-[10px] text-slate-500">Nenhuma conta pendente para este mês.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingBills.slice(0, 3).map((bill) => (
                  <div
                    key={bill.id}
                    className="p-3 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: `${bill.categoryColor}20`,
                          borderColor: bill.categoryColor,
                          color: bill.categoryColor,
                        }}
                      >
                        <CategoryIcon icon={bill.categoryIcon} className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-white block truncate">{bill.name}</span>
                        <span className="text-[10px] text-slate-400 block">
                          Dia {bill.dueDay} · {bill.statusText}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono-nums text-xs font-bold text-white">
                        {formatCurrency(bill.amount)}
                      </span>
                      <button
                        onClick={() => toggleBillPaid(bill.id, true)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold transition-all active:scale-95"
                      >
                        Pagar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        transaction={txToDelete}
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
      />

      {/* Month Cycle Modal */}
      <MonthCycleModal
        isOpen={isMonthCycleModalOpen}
        onClose={() => setIsMonthCycleModalOpen(false)}
      />
    </div>
  );
};
