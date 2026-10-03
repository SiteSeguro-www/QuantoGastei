import React from 'react';
import {
  Home,
  Clock,
  BarChart3,
  Calendar,
  CreditCard,
  Tag,
  User,
  Plus,
  Palette,
  Sun,
  Moon,
  Sparkles,
  LayoutGrid,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { ViewTab } from '../types/finance';
import { PWACompactInstallButton } from './PWAInstallSection';
import { AVAILABLE_THEMES } from '../data/themesData';

export const ModernTopbarNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsAddModalOpen,
    setIsAccountModalOpen,
    isThemeModalOpen,
    setIsThemeModalOpen,
    currentTheme,
    toggleThemeMode,
    layoutMode,
    toggleLayoutMode,
    setEditingTransaction,
    activeProfile,
    availableBalance,
    formatCurrency,
  } = useFinance();

  const isLight = currentTheme === 'light-clean' || currentTheme === 'light-nordic';
  const currentThemeObj = AVAILABLE_THEMES.find((t) => t.id === currentTheme) || AVAILABLE_THEMES[0];

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsAddModalOpen(true);
  };

  const navItems: { tab: ViewTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: Home },
    { tab: 'history', label: 'Histórico', icon: Clock },
    { tab: 'analytics', label: 'Análises', icon: BarChart3 },
    { tab: 'calendar', label: 'Calendário', icon: Calendar },
    { tab: 'fixed-bills', label: 'Contas Fixas', icon: CreditCard },
    { tab: 'categories', label: 'Categorias', icon: Tag },
    { tab: 'profile', label: 'Perfil', icon: User },
  ];

  return (
    <header className="hidden md:block sticky top-0 z-40 bg-[#0C101A]/95 backdrop-blur-xl border-b border-white/[0.08] px-4 lg:px-8 py-3 select-none transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2.5 text-left hover:opacity-85 transition-opacity"
            title="Ir para a Página Inicial"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight block">
                QuantoGastei
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold block -mt-0.5 uppercase tracking-wider">
                Layout Bento
              </span>
            </div>
          </button>

          {/* Horizontal Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-2xl border border-white/5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/25 scale-[1.02]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Tools & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Layout Mode Toggle Button */}
          <button
            onClick={toggleLayoutMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-slate-300 transition-all active:scale-95"
            title="Alternar entre o Layout Bento Topbar e o Layout Clássico com Barra Lateral"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
            <span>Layout: Bento</span>
          </button>

          {/* Theme Quick Switcher */}
          <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5">
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
              title="Catálogo completo de temas e layouts"
            >
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden lg:inline text-[11px]">{currentThemeObj.name.split('(')[0]}</span>
            </button>
            <button
              onClick={toggleThemeMode}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 transition-colors"
              title={isLight ? 'Modo Escuro' : 'Modo Claro'}
            >
              {isLight ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-purple-400" />}
            </button>
          </div>

          {/* Quick Balance Pill */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Saldo:</span>
            <span className="font-mono-nums font-extrabold text-emerald-400">
              {formatCurrency(availableBalance)}
            </span>
          </div>

          {/* Account Profile Dropdown Trigger */}
          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
            title="Gerenciar contas ou alternar usuário"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
              {activeProfile.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-bold text-white max-w-[90px] truncate">
              {activeProfile.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {/* Main Action Button in Topbar */}
          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:brightness-110 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Adicionar</span>
          </button>

          <PWACompactInstallButton />
        </div>
      </div>
    </header>
  );
};
