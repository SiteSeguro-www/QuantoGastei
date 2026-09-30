import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { DesktopSidebar, MobileBottomNav } from './components/Navigation';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AccountManagerModal } from './components/AccountManagerModal';
import { ToastContainer } from './components/ToastContainer';
import { DashboardView } from './views/DashboardView';
import { HistoryView } from './views/HistoryView';
import { AnalyticsView } from './views/AnalyticsView';
import { CalendarView } from './views/CalendarView';
import { FixedBillsView } from './views/FixedBillsView';
import { CategoriesView } from './views/CategoriesView';
import { ProfileView } from './views/ProfileView';
import { Users, ChevronDown, Plus } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    isAddModalOpen,
    setIsAddModalOpen,
    isAccountModalOpen,
    setIsAccountModalOpen,
    activeProfile,
  } = useFinance();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'history':
        return <HistoryView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'calendar':
        return <CalendarView />;
      case 'fixed-bills':
        return <FixedBillsView />;
      case 'categories':
        return <CategoriesView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#090A0F] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-emerald-500/25 selection:text-emerald-300 w-full overflow-x-hidden">
      {/* Toast notifications */}
      <ToastContainer />

      {/* Desktop Sidebar (visible on md+) */}
      <DesktopSidebar />

      {/* Mobile Top Header (visible on mobile only) */}
      <header className="md:hidden sticky top-0 z-30 bg-[#090A0F]/95 backdrop-blur-md border-b border-white/[0.08] px-3.5 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-sm shrink-0">
            <span className="text-xs">💰</span>
          </div>
          <span className="text-sm font-extrabold text-white tracking-tight truncate">
            QuantoGastei
          </span>
        </div>

        {/* Quick Account Switcher Button */}
        <button
          onClick={() => setIsAccountModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 active:scale-95 transition-all shrink-0 max-w-[170px]"
          title="Alternar conta ou adicionar novo usuário"
        >
          <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-extrabold shrink-0">
            {activeProfile.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs font-semibold text-slate-200 truncate">
            {activeProfile.name}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen w-full overflow-x-hidden">
        <div className="w-full max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-7 flex-1 pb-28 md:pb-12">
          {renderActiveView()}
        </div>
      </main>

      {/* Mobile Bottom Navigation (visible on mobile) */}
      <MobileBottomNav />

      {/* Global Add/Edit Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Global Account & User Management Modal */}
      <AccountManagerModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
}
