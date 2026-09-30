import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { DesktopSidebar, MobileBottomNav } from './components/Navigation';
import { AddTransactionModal } from './components/AddTransactionModal';
import { ToastContainer } from './components/ToastContainer';
import { DashboardView } from './views/DashboardView';
import { HistoryView } from './views/HistoryView';
import { AnalyticsView } from './views/AnalyticsView';
import { CalendarView } from './views/CalendarView';
import { FixedBillsView } from './views/FixedBillsView';
import { CategoriesView } from './views/CategoriesView';
import { ProfileView } from './views/ProfileView';

const AppContent: React.FC = () => {
  const { activeTab, isAddModalOpen, setIsAddModalOpen } = useFinance();

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
      <header className="md:hidden sticky top-0 z-30 bg-[#090A0F]/90 backdrop-blur-md border-b border-white/[0.08] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-sm">
            <span className="text-xs">💰</span>
          </div>
          <span className="text-sm font-bold text-white tracking-tight">Meu Financeiro</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400 capitalize">
            {activeTab === 'dashboard' ? 'Início' : activeTab === 'history' ? 'Histórico' : activeTab === 'analytics' ? 'Resumo' : activeTab === 'calendar' ? 'Calendário' : activeTab === 'fixed-bills' ? 'Contas' : activeTab === 'categories' ? 'Categorias' : 'Perfil'}
          </span>
        </div>
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
