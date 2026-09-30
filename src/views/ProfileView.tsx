import React, { useState } from 'react';
import {
  User,
  Download,
  Upload,
  RefreshCw,
  Shield,
  FileSpreadsheet,
  FileJson,
  Printer,
  Moon,
  Coins,
  Bell,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Database,
  Lock,
  UserPlus,
  Users,
  Trash2,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { UserProfile } from '../types/finance';
import { PWAInstallSection } from '../components/PWAInstallSection';

export const ProfileView: React.FC = () => {
  const {
    activeProfile,
    profiles,
    switchProfile,
    deleteProfile,
    monthExpenses,
    monthIncome,
    availableBalance,
    formatCurrency,
    exportDataCSV,
    exportDataJSON,
    importDataJSON,
    resetToDefaults,
    setActiveTab,
    setIsAccountModalOpen,
    showToast,
  } = useFinance();

  const [importFileContent, setImportFileContent] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<UserProfile | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportFileContent(content);
        setIsImportModalOpen(true);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (importDataJSON(importFileContent)) {
      setIsImportModalOpen(false);
      setImportFileContent('');
    }
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleConfirmDelete = () => {
    if (!profileToDelete) return;
    deleteProfile(profileToDelete.id);
    setProfileToDelete(null);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Profile Card Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#121622] via-[#161B2B] to-[#121622] border border-white/[0.08] relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-950/50">
              <div className="w-full h-full rounded-2xl bg-[#090A0F] flex items-center justify-center text-emerald-400 font-extrabold text-2xl">
                {activeProfile.name.charAt(0)}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#090A0F] flex items-center justify-center text-slate-950">
              <Shield className="w-3 h-3 stroke-[3]" />
            </div>
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {activeProfile.name}
                </h1>
                <p className="text-xs text-slate-400">{activeProfile.email}</p>
              </div>

              {/* Profile switch button */}
              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="flex items-center gap-2 self-center sm:self-auto bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-300 transition-all active:scale-95"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Gerenciar / Trocar Conta ({profiles.length})</span>
              </button>
            </div>

            {/* Monthly mini-stats */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-5 pt-4 border-t border-white/10 text-center">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block truncate">
                  Gastos Mês
                </span>
                <span className="font-mono-nums text-[11px] sm:text-sm font-bold text-rose-400 block mt-0.5 truncate tracking-tight">
                  {formatCurrency(monthExpenses)}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block truncate">
                  Entradas Mês
                </span>
                <span className="font-mono-nums text-[11px] sm:text-sm font-bold text-emerald-400 block mt-0.5 truncate tracking-tight">
                  {formatCurrency(monthIncome)}
                </span>
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block truncate">
                  Saldo Líquido
                </span>
                <span className="font-mono-nums text-[11px] sm:text-sm font-bold text-sky-400 block mt-0.5 truncate tracking-tight">
                  {formatCurrency(availableBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accounts & Users Management Box */}
      <div className="p-5 rounded-2xl bg-[#121622]/90 border border-white/[0.07] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Contas & Usuários ({profiles.length})
            </h3>
          </div>

          <button
            onClick={() => setIsAccountModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-all self-start sm:self-auto active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            + Nova Conta / Adicionar Usuário
          </button>
        </div>

        {/* List of profiles inline */}
        <div className="space-y-2.5">
          {profiles.map((p) => {
            const isActive = p.id === activeProfile.id;
            const isOnlyOne = profiles.length <= 1;

            return (
              <div
                key={p.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isActive
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-black/20 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-white/5 text-slate-300 border-white/10'
                    }`}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{p.name}</span>
                      {isActive && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 flex items-center gap-0.5 shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                          Ativa
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block truncate">{p.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!isActive && (
                    <button
                      onClick={() => switchProfile(p.id)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-[11px] font-semibold transition-colors"
                    >
                      Alternar
                    </button>
                  )}

                  <button
                    onClick={() => setProfileToDelete(p)}
                    disabled={isOnlyOne}
                    title={
                      isOnlyOne
                        ? 'Você não pode excluir a única conta restante'
                        : `Excluir conta ${p.name}`
                    }
                    className={`p-1.5 rounded-lg border transition-all ${
                      isOnlyOne
                        ? 'opacity-20 cursor-not-allowed border-transparent text-slate-600'
                        : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border-transparent hover:border-rose-500/20'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PWA Application Installation Section */}
      <PWAInstallSection />

      {/* Security & Privacy Notice */}
      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-3">
        <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold text-emerald-300">
            Privacidade e Segurança Total
          </h4>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            Seus registros financeiros são isolados por conta e armazenados com persistência local criptografada. Nenhuma outra conta tem acesso aos seus dados.
          </p>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="p-5 rounded-2xl bg-[#121622]/90 border border-white/[0.07] space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Gerenciamento
        </h3>

        <button
          onClick={() => setActiveTab('fixed-bills')}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Contas Recorrentes</span>
              <span className="text-[11px] text-slate-400 block">Gerenciar aluguel, energia, internet...</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Categorias Personalizadas</span>
              <span className="text-[11px] text-slate-400 block">Adicionar categorias, ícones e cores</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Export & Data Backup */}
      <div className="p-5 rounded-2xl bg-[#121622]/90 border border-white/[0.07] space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Exportação & Backup de Dados
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => exportDataCSV('all')}
            className="p-3.5 rounded-xl bg-black/30 hover:bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center gap-2 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Exportar CSV</span>
              <span className="text-[10px] text-slate-500 block">Planilha Excel / Sheets</span>
            </div>
          </button>

          <button
            onClick={exportDataJSON}
            className="p-3.5 rounded-xl bg-black/30 hover:bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center gap-2 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-sky-500/15 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Backup JSON</span>
              <span className="text-[10px] text-slate-500 block">Arquivo completo</span>
            </div>
          </button>

          <button
            onClick={handlePrintReport}
            className="p-3.5 rounded-xl bg-black/30 hover:bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center gap-2 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">Imprimir / PDF</span>
              <span className="text-[10px] text-slate-500 block">Relatório para salvar</span>
            </div>
          </button>
        </div>

        {/* Restore Backup & Reset Demo */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <label className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors">
            <Upload className="w-3.5 h-3.5 text-sky-400" />
            Restaurar Backup (JSON)
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={resetToDefaults}
            className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-400 hover:text-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restaurar Dados Demo
          </button>
        </div>
      </div>

      {/* Import confirmation modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-[#121622] border border-white/10 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">
              Confirmar Restauração de Backup?
            </h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Os registros financeiros atuais desta conta serão substituídos pelos registros contidos no arquivo JSON.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-white/10 text-xs font-semibold text-slate-400"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmImport}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
              >
                Restaurar Agora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete profile confirmation modal */}
      {profileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#121622] border border-rose-500/30 p-5 shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Excluir conta "{profileToDelete.name}"?
                </h3>
                <span className="text-[11px] text-rose-400 font-semibold block">
                  Ação irreversível
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Todos os lançamentos financeiros, despesas e dados registrados nesta conta serão apagados permanentemente.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setProfileToDelete(null)}
                className="py-2.5 px-3 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-950/40 transition-colors"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
