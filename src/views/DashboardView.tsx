import React, { useState } from 'react';
import {
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Wallet,
  Calendar,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useFinance, getTodayString } from '../context/FinanceContext';
import { QUICK_PRESETS } from '../data/initialData';
import { TransactionItem } from '../components/TransactionItem';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { Transaction } from '../types/finance';
import { CategoryIcon } from '../components/CategoryIcon';

export const DashboardView: React.FC = () => {
  const {
    activeProfile,
    profiles,
    switchProfile,
    todayExpenses,
    monthExpenses,
    totalFixedBillsAmount,
    availableBalance,
    upcomingBills,
    transactions,
    setIsAddModalOpen,
    setEditingTransaction,
    setPresetPreload,
    setActiveTab,
    toggleBillPaid,
    formatCurrency,
  } = useFinance();

  // Delete modal state
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  const todayStr = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  // Filter transactions for dashboard
  const todayTransactions = transactions.filter((t) => t.date === todayStr);
  const yesterdayTransactions = transactions.filter((t) => t.date === yesterdayStr);

  const handleOpenAdd = () => {
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

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Top Greeting & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Olá {activeProfile.name} 👋
            </h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Como estão suas finanças hoje?
          </p>
        </div>

        {/* Profile / Account switcher */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
            <span className="text-xs text-slate-400">Conta:</span>
            <select
              value={activeProfile.id}
              onChange={(e) => switchProfile(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white outline-none cursor-pointer"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4 Main Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Gastos de Hoje */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#121622]/90 border border-white/[0.07] relative overflow-hidden group hover:border-white/15 transition-all min-w-0">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
              Gastos de Hoje
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-500/15 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="font-mono-nums text-sm sm:text-2xl font-extrabold text-rose-400 tracking-tight truncate">
            {formatCurrency(todayExpenses)}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block truncate">
            {todayTransactions.length} {todayTransactions.length === 1 ? 'registro' : 'registros'} hoje
          </span>
        </div>

        {/* Gastos do Mês */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#121622]/90 border border-white/[0.07] relative overflow-hidden group hover:border-white/15 transition-all min-w-0">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
              Gastos do Mês
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="font-mono-nums text-sm sm:text-2xl font-extrabold text-white tracking-tight truncate">
            {formatCurrency(monthExpenses)}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block truncate">
            Setembro de 2026
          </span>
        </div>

        {/* Total de Contas */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#121622]/90 border border-white/[0.07] relative overflow-hidden group hover:border-white/15 transition-all min-w-0">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 truncate">
              Total de Contas
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-sky-500/15 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="font-mono-nums text-sm sm:text-2xl font-extrabold text-slate-200 tracking-tight truncate">
            {formatCurrency(totalFixedBillsAmount)}
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block truncate">
            {upcomingBills.length} a vencer
          </span>
        </div>

        {/* Saldo Disponível */}
        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-[#121622]/90 border border-emerald-500/20 relative overflow-hidden group hover:border-emerald-500/40 transition-all glow-emerald min-w-0">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-emerald-400 truncate">
              Saldo Disponível
            </span>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="font-mono-nums text-sm sm:text-2xl font-extrabold text-emerald-400 tracking-tight truncate">
            {formatCurrency(availableBalance)}
          </div>
          <span className="text-[10px] sm:text-[11px] text-emerald-400/70 mt-1 block truncate">
            Saldo livre
          </span>
        </div>
      </div>

      {/* Primary "+ Adicionar gasto" Button (Prominent Call to Action) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleOpenAdd}
          className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:brightness-110 text-slate-950 font-extrabold text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-950/40 active:scale-[0.99] transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-slate-950/20 flex items-center justify-center">
            <Plus className="w-5 h-5 text-slate-950 stroke-[3]" />
          </div>
          <span>+ Adicionar gasto</span>
        </button>
      </div>

      {/* Quick Favorite Presets Horizontal Bar */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Gastos rápidos do dia a dia (1 toque)
          </span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {QUICK_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleQuickPreset(preset)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#121622] hover:bg-[#181E2E] border border-white/[0.06] hover:border-emerald-500/30 shrink-0 text-left transition-all active:scale-95"
            >
              <span className="text-lg leading-none">{preset.emoji}</span>
              <div>
                <span className="text-xs font-semibold text-white block">
                  {preset.name}
                </span>
                <span className="font-mono-nums text-[11px] font-bold text-rose-400 block -mt-0.5">
                  R$ {preset.amount.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Upcoming Bills Widget */}
      {upcomingBills.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#121622]/90 border border-white/[0.07]">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Próximas Contas a Vencer
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('fixed-bills')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              Ver todas ({upcomingBills.length})
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            {upcomingBills.slice(0, 4).map((bill) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl bg-black/30 border border-white/5 hover:border-white/10 transition-colors gap-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{
                      backgroundColor: `${bill.categoryColor}20`,
                      borderColor: bill.categoryColor,
                      color: bill.categoryColor,
                    }}
                  >
                    <CategoryIcon icon={bill.categoryIcon} className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-semibold text-white truncate">
                      {bill.name}
                    </h4>
                    <span
                      className={`text-[10px] sm:text-[11px] font-medium block truncate ${
                        bill.daysUntilDue <= 2 ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    >
                      {bill.statusText} · Dia {bill.dueDay}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono-nums text-xs font-bold text-slate-200 whitespace-nowrap">
                    {formatCurrency(bill.amount)}
                  </span>
                  <button
                    onClick={() => toggleBillPaid(bill.id, true)}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold transition-colors active:scale-95"
                    title="Pagar e registrar gasto"
                  >
                    Pagar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white tracking-tight">
              Gastos Recentes
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            Ver histórico completo
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Today's Section */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hoje ({todayTransactions.length})
            </span>
            <span className="text-xs font-bold font-mono-nums text-rose-400">
              Total: {formatCurrency(todayExpenses)}
            </span>
          </div>

          {todayTransactions.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#121622]/50 border border-dashed border-white/10 text-center">
              <p className="text-xs text-slate-400 mb-2">Nenhum gasto registrado hoje ainda.</p>
              <button
                onClick={handleOpenAdd}
                className="text-xs font-semibold text-emerald-400 hover:underline"
              >
                + Registrar primeiro gasto do dia
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {todayTransactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onOpenDelete={(t) => setTxToDelete(t)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Yesterday's Section */}
        {yesterdayTransactions.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Ontem
              </span>
              <span className="text-xs font-bold font-mono-nums text-slate-400">
                Total:{' '}
                {formatCurrency(
                  yesterdayTransactions
                    .filter((t) => t.type === 'expense')
                    .reduce((a, b) => a + b.amount, 0)
                )}
              </span>
            </div>

            <div className="space-y-2">
              {yesterdayTransactions.map((tx) => (
                <TransactionItem
                  key={tx.id}
                  transaction={tx}
                  onOpenDelete={(t) => setTxToDelete(t)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        transaction={txToDelete}
        isOpen={!!txToDelete}
        onClose={() => setTxToDelete(null)}
      />
    </div>
  );
};
