import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  User,
  Shield,
  AlertTriangle,
  ArrowRight,
  Wallet,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { UserProfile } from '../types/finance';

interface AccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountManagerModal: React.FC<AccountManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    profiles,
    activeProfile,
    switchProfile,
    addProfile,
    deleteProfile,
    formatCurrency,
  } = useFinance();

  const [isCreating, setIsCreating] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountIncome, setNewAccountIncome] = useState('');

  // Deletion state
  const [accountToDelete, setAccountToDelete] = useState<UserProfile | null>(null);

  if (!isOpen) return null;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    const rawIncome = newAccountIncome.trim().replace(',', '.');
    const incomeGoal = rawIncome === '' ? 0 : (parseFloat(rawIncome) || 0);
    addProfile(newAccountName.trim(), incomeGoal);
    setNewAccountName('');
    setNewAccountIncome('');
    setIsCreating(false);
    onClose();
  };

  const handleConfirmDelete = () => {
    if (!accountToDelete) return;
    deleteProfile(accountToDelete.id);
    setAccountToDelete(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200 p-0 sm:p-4">
      <div
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-[#0F131D] border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-950/40">
              <User className="w-4 h-4 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Contas & Usuários
              </h2>
              <p className="text-[11px] text-slate-400">
                Gerencie perfis, adicione novas contas ou exclua usuários
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Quick Info Banner */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-xs text-emerald-300/90 leading-tight">
              Cada conta possui seus próprios lançamentos, contas fixas e categorias 100% segregadas e salvas.
            </p>
          </div>

          {/* New Account Creation Form Toggle */}
          {!isCreating ? (
            <button
              onClick={() => setIsCreating(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              + Nova Conta / Adicionar Novo Usuário
            </button>
          ) : (
            <form
              onSubmit={handleCreateSubmit}
              className="p-4 rounded-2xl bg-black/50 border border-emerald-500/30 space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  Cadastrar Nova Conta
                </span>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Nome da Conta ou Usuário *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pessoal, Empresa PJ, Família, Mariana..."
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Renda Mensal Estimada (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-mono">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 5000,00 ou deixe em branco"
                    value={newAccountIncome}
                    onChange={(e) => setNewAccountIncome(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-white/10 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newAccountName.trim()}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold text-white shadow-lg shadow-emerald-950/40"
                >
                  Criar e Entrar
                </button>
              </div>
            </form>
          )}

          {/* List of Accounts */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
              Contas Cadastradas ({profiles.length})
            </span>

            {profiles.map((profile) => {
              const isActive = profile.id === activeProfile.id;
              const isOnlyOne = profiles.length <= 1;

              return (
                <div
                  key={profile.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-emerald-950/20 border-emerald-500/40 shadow-sm'
                      : 'bg-black/30 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-white/5 text-slate-300 border-white/10'
                      }`}
                    >
                      {profile.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate">
                          {profile.name}
                        </h4>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                            <Check className="w-3 h-3 stroke-[3]" />
                            Ativa
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {profile.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {!isActive ? (
                      <button
                        onClick={() => {
                          switchProfile(profile.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        Entrar
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-400 px-2">
                        Em uso
                      </span>
                    )}

                    {/* Delete account button */}
                    <button
                      onClick={() => setAccountToDelete(profile)}
                      disabled={isOnlyOne}
                      title={
                        isOnlyOne
                          ? 'Você não pode excluir a única conta existente'
                          : `Excluir conta ${profile.name}`
                      }
                      className={`p-2 rounded-xl border transition-all ${
                        isOnlyOne
                          ? 'opacity-25 cursor-not-allowed border-transparent text-slate-600'
                          : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border-transparent hover:border-rose-500/20'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/5 bg-black/40 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Delete Confirmation Nested Dialog */}
      {accountToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-2xl bg-[#121622] border border-rose-500/30 p-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Excluir conta "{accountToDelete.name}"?
                </h3>
                <span className="text-[11px] text-rose-400 font-semibold block">
                  Ação irreversível
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mb-5">
              Todos os lançamentos financeiros, despesas, receitas e contas cadastradas para esta conta serão apagados permanentemente.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
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
