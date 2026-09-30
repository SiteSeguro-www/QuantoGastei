import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { UserProfile } from '../types/finance';
import {
  Sparkles,
  UserCheck,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Zap,
  CreditCard,
  BarChart3,
  Lock,
  CheckCircle2,
  Wallet,
  Coins,
  Users,
  Check,
  Download,
  Calendar,
  Layers,
  Flame,
} from 'lucide-react';
import { PWACompactInstallButton } from '../components/PWAInstallSection';

export const LandingPageView: React.FC = () => {
  const {
    profiles,
    activeProfile,
    switchProfile,
    addProfile,
    setActiveTab,
    formatCurrency,
  } = useFinance();

  const [activeCardTab, setActiveCardTab] = useState<'select' | 'create'>('select');
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountIncome, setNewAccountIncome] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState<string>(activeProfile.id);

  // Handle selecting profile and entering dashboard
  const handleSelectAndEnter = (profileId: string) => {
    switchProfile(profileId);
    setSelectedProfileId(profileId);
    setActiveTab('dashboard');
  };

  // Handle creating new profile and entering immediately
  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    const rawIncome = newAccountIncome.trim().replace(',', '.');
    const incomeGoal = rawIncome === '' ? 0 : parseFloat(rawIncome) || 0;

    const created = addProfile(newAccountName.trim(), incomeGoal);
    setNewAccountName('');
    setNewAccountIncome('');
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#080B11] text-slate-100 flex flex-col justify-between overflow-x-hidden lg:overflow-hidden select-none">
      {/* Dynamic Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 w-full border-b border-white/[0.07] bg-[#0A0D15]/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-950/50 shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-black text-white tracking-tight">
                QuantoGastei
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PWA
              </span>
            </div>
            <span className="hidden sm:block text-[11px] text-slate-400 -mt-0.5">
              Controle Financeiro Pessoal Inteligente
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <PWACompactInstallButton className="text-xs py-1.5 px-3" />
          
          <button
            onClick={() => handleSelectAndEnter(activeProfile.id)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition-all active:scale-95 shadow-sm"
          >
            <span>Entrar no App</span>
            <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>
      </header>

      {/* Main Single Page Fit-to-Screen Grid */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col justify-center min-h-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center lg:items-stretch min-h-0">
          
          {/* LEFT SIDE: Everything the app does (Presentation & Value Prop) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-4 lg:space-y-3 min-h-0">
            {/* Hero Headline & Subhead */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                <span>Gestão financeira simplificada sem planilhas chatas</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Saiba exatamente <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">quanto gastou</span> e tenha controle total do seu dinheiro.
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                O <strong>QuantoGastei</strong> foi criado para quem quer praticidade no dia a dia. Gerencie múltiplas contas, lance gastos em segundos, programe contas fixas e acompanhe seu saldo livre em tempo real no celular ou PC.
              </p>
            </div>

            {/* Feature Showcase Grid (6 Core Features explained cleanly) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
              {/* Feature 1 */}
              <div className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] transition-colors group">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white tracking-tight">Múltiplos Usuários</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Crie e alterne contas individuais com dados e metas 100% isolados.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] transition-colors group">
                <div className="w-7 h-7 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white tracking-tight">Lançamento Rápido</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Adicione gastos e receitas com botões rápidos (+1, +5, +10) e categorias.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] transition-colors group">
                <div className="w-7 h-7 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white tracking-tight">Contas Fixas</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Acompanhe aluguel, luz e internet com alertas de prazo e baixa direta.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] transition-colors group">
                <div className="w-7 h-7 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white tracking-tight">Gráficos & Resumos</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Visão diária e mensal, gastos por categoria e exportação CSV/PDF.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] transition-colors group">
                <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white tracking-tight">100% Privado</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Dados armazenados de forma criptografada no seu dispositivo. Sem anúncios.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.07] transition-colors group">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white tracking-tight">App PWA Offline</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Instale no Android, iOS ou Desktop e utilize mesmo sem conexão.
                </p>
              </div>
            </div>

            {/* Micro Badges Footer */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 bg-emerald-950/30 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sem mensalidades
              </span>
              <span className="flex items-center gap-1 bg-white/[0.03] text-slate-300 px-2.5 py-1 rounded-lg border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Abertura Instantânea
              </span>
              <span className="flex items-center gap-1 bg-white/[0.03] text-slate-300 px-2.5 py-1 rounded-lg border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Compatível Celular & PC
              </span>
            </div>
          </div>

          {/* RIGHT SIDE: Account / User Selector & Creator Hub */}
          <div className="lg:col-span-5 flex flex-col justify-center min-h-0">
            <div className="w-full rounded-3xl bg-gradient-to-b from-[#141A29] to-[#0E121E] border border-emerald-500/30 p-4 sm:p-6 shadow-2xl shadow-emerald-950/30 flex flex-col justify-between space-y-4">
              
              {/* Card Top Title & Tabs */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-white">Acessar QuantoGastei</h2>
                      <p className="text-[11px] text-slate-400">Escolha o usuário ou crie uma conta</p>
                    </div>
                  </div>
                </div>

                {/* Segmented Switch: Select Existing vs Create New */}
                <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 mt-3.5">
                  <button
                    type="button"
                    onClick={() => setActiveCardTab('select')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeCardTab === 'select'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Contas ({profiles.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveCardTab('create')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      activeCardTab === 'create'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Nova Conta</span>
                  </button>
                </div>
              </div>

              {/* TAB 1: Select Existing Account */}
              {activeCardTab === 'select' && (
                <div className="space-y-3 flex-1 flex flex-col justify-between min-h-[220px]">
                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                    {profiles.map((p) => {
                      const isSelected = p.id === selectedProfileId;
                      const isActiveCurrent = p.id === activeProfile.id;

                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSelectedProfileId(p.id);
                            switchProfile(p.id);
                          }}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md shadow-emerald-950/30'
                              : 'bg-black/20 border-white/5 hover:border-white/15 hover:bg-white/[0.02]'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border ${
                                isSelected
                                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                                  : 'bg-white/5 text-slate-300 border-white/10'
                              }`}
                            >
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-white truncate">
                                  {p.name}
                                </span>
                                {isActiveCurrent && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-400 flex items-center gap-0.5">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" /> Ativa
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block truncate">
                                Renda: {p.monthlyIncomeGoal > 0 ? formatCurrency(p.monthlyIncomeGoal) : 'Não informada'}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                  : 'border-white/20 bg-transparent'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Big Action Button to Enter as Selected */}
                  <button
                    type="button"
                    onClick={() => handleSelectAndEnter(selectedProfileId)}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:brightness-110 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-[0.98] transition-all"
                  >
                    <span>Entrar no Painel</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              )}

              {/* TAB 2: Create New Account Inline */}
              {activeCardTab === 'create' && (
                <form onSubmit={handleCreateAccount} className="space-y-3 flex-1 flex flex-col justify-between min-h-[220px]">
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Nome da Nova Conta / Usuário *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Minha Conta, Trabalho, Pessoal..."
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                        Renda Mensal Inicial (R$) (Opcional)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                          R$
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 5000,00 ou deixe em branco"
                          value={newAccountIncome}
                          onChange={(e) => setNewAccountIncome(e.target.value)}
                          className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Nova conta começará com dados 100% limpos e renda registrada no saldo.
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!newAccountName.trim()}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-[0.98] transition-all"
                  >
                    <span>Criar Conta e Acessar 🚀</span>
                  </button>
                </form>
              )}

              {/* Security Hint */}
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Armazenamento local seguro. Nenhuma senha exigida.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer minimal info bar */}
      <footer className="relative z-10 w-full border-t border-white/[0.05] bg-[#07090E]/90 py-2.5 px-4 text-center text-[11px] text-slate-400 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>QuantoGastei • Seu controle financeiro pessoal moderno e seguro</span>
          <div className="flex items-center gap-4">
            <span className="text-emerald-400">● Sistema Operacional & PWA Ativo</span>
            <button
              onClick={() => handleSelectAndEnter(activeProfile.id)}
              className="text-slate-300 hover:text-white underline transition-colors"
            >
              Acessar Painel Agora
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
