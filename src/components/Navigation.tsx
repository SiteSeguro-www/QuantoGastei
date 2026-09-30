import React from 'react';
import {
  Home,
  BarChart3,
  Plus,
  Clock,
  User,
  Calendar,
  CreditCard,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { ViewTab } from '../types/finance';
import { PWACompactInstallButton } from './PWAInstallSection';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setIsAddModalOpen, setEditingTransaction } = useFinance();

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  const navItems: { tab: ViewTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'dashboard', label: 'Início', icon: Home },
    { tab: 'analytics', label: 'Resumo', icon: BarChart3 },
    { tab: 'history', label: 'Histórico', icon: Clock },
    { tab: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0D15]/95 backdrop-blur-xl border-t border-white/[0.08] pb-safe">
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        {/* Início */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
            activeTab === 'dashboard' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Início</span>
        </button>

        {/* Resumo */}
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
            activeTab === 'analytics' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Resumo</span>
        </button>

        {/* Big Central Add Button */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={handleOpenAdd}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-transform"
            aria-label="Adicionar gasto"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Histórico */}
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
            activeTab === 'history' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Histórico</span>
        </button>

        {/* Perfil */}
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center py-1 transition-colors min-h-[44px] ${
            activeTab === 'profile' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1">Perfil</span>
        </button>
      </div>
    </nav>
  );
};

export const DesktopSidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsAddModalOpen,
    setIsAccountModalOpen,
    setEditingTransaction,
    activeProfile,
    profiles,
    switchProfile,
    availableBalance,
    formatCurrency,
  } = useFinance();

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  const navItems: { tab: ViewTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: Home },
    { tab: 'history', label: 'Histórico & Gastos', icon: Clock },
    { tab: 'analytics', label: 'Resumo & Gráficos', icon: BarChart3 },
    { tab: 'calendar', label: 'Calendário Financeiro', icon: Calendar },
    { tab: 'fixed-bills', label: 'Contas Fixas', icon: CreditCard },
    { tab: 'categories', label: 'Categorias', icon: Tag },
    { tab: 'profile', label: 'Perfil & Configurações', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 shrink-0 bg-[#0C101A] border-r border-white/[0.08] p-4 select-none">
      {/* Brand header */}
      <div className="flex items-center justify-between px-2 py-2 mb-4">
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-2.5 text-left hover:opacity-85 transition-opacity"
          title="Ir para a Página Inicial"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-950/40 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-extrabold text-white tracking-tight block">
              QuantoGastei
            </span>
            <span className="text-[11px] text-slate-400 block -mt-0.5">
              Controle Pessoal
            </span>
          </div>
        </button>
        <PWACompactInstallButton />
      </div>

      {/* Main Action Button */}
      <button
        onClick={handleOpenAdd}
        className="w-full mb-6 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 active:scale-[0.98] transition-all"
      >
        <Plus className="w-4 h-4 stroke-[3]" />
        + Adicionar Gasto
      </button>

      {/* Navigation Links */}
      <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-white/10 text-emerald-400 border border-white/10 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Profile & Balance Card */}
      <div className="pt-4 border-t border-white/[0.06] space-y-3">
        {/* Quick Balance Status */}
        <div className="p-3 rounded-xl bg-black/40 border border-white/5">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
            Saldo Disponível
          </span>
          <span className="text-base font-bold font-mono-nums text-emerald-400 block mt-0.5">
            {formatCurrency(availableBalance)}
          </span>
        </div>

        {/* Profile Switcher */}
        <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-xs shrink-0">
              {activeProfile.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold text-white block truncate">
                {activeProfile.name}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                {activeProfile.email}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="w-full py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 border border-white/5 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Gerenciar Contas / + Nova</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
