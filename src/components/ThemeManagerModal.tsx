import React from 'react';
import {
  X,
  Palette,
  Check,
  Sun,
  Moon,
  Sparkles,
  Layers,
  ArrowRight,
  LayoutGrid,
  Columns,
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { AVAILABLE_THEMES } from '../data/themesData';
import { ThemeId, LayoutMode } from '../types/finance';

interface ThemeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeManagerModal: React.FC<ThemeManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentTheme, setTheme, layoutMode, setLayoutMode, showToast } = useFinance();

  if (!isOpen) return null;

  const handleSelectTheme = (themeId: ThemeId) => {
    setTheme(themeId);
    const selected = AVAILABLE_THEMES.find((t) => t.id === themeId);
    showToast(`✓ Cor alterada para "${selected?.name || themeId}"!`, 'success');
  };

  const activeThemeObj = AVAILABLE_THEMES.find((t) => t.id === currentTheme) || AVAILABLE_THEMES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-[#121622] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0 bg-[#121622]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-950/40 shrink-0">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Arquitetura de Layout & Temas
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  2 Modelos de Layout
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Alterne a estrutura de navegação, posição de botões e paleta visual
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION 1: ESTRUTURA DE LAYOUT (NOVO) */}
        <div className="p-4 sm:p-5 bg-black/25 border-b border-white/10 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" />
              1. Selecione a Estrutura & Posição dos Botões (Layout)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Model 1: Bento Executivo */}
            <button
              onClick={() => setLayoutMode('modern-bento')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                layoutMode === 'modern-bento'
                  ? 'bg-emerald-950/30 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg'
                  : 'bg-black/30 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                    <LayoutGrid className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Modelo Bento Executivo</span>
                    <span className="text-[10px] text-emerald-400 font-extrabold uppercase">Novo Layout Topbar</span>
                  </div>
                </div>
                {layoutMode === 'modern-bento' && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Navegação horizontal no topo, Master Wallet Card, botões em pílula, chips de ação rápida e grid dividido em 2 colunas.
              </p>
            </button>

            {/* Model 2: Clássico Barra Lateral */}
            <button
              onClick={() => setLayoutMode('classic-sidebar')}
              className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                layoutMode === 'classic-sidebar'
                  ? 'bg-purple-950/30 border-purple-500 ring-2 ring-purple-500/40 shadow-lg'
                  : 'bg-black/30 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center">
                    <Columns className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Modelo Clássico Pro</span>
                    <span className="text-[10px] text-purple-400 font-extrabold uppercase">Barra Lateral Fixa</span>
                  </div>
                </div>
                {layoutMode === 'classic-sidebar' && (
                  <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Barra lateral vertical à esquerda no desktop, barra de navegação no rodapé mobile e cartões de estatísticas verticais.
              </p>
            </button>
          </div>
        </div>

        {/* SECTION 2: PALETA DE CORES & MODO */}
        <div className="px-5 py-2.5 bg-black/40 border-b border-white/5 flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-purple-400" />
            2. Selecione o Tema de Cores:
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSelectTheme('light-clean')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                currentTheme === 'light-clean' || currentTheme === 'light-nordic'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Tema Claro ☀️</span>
            </button>

            <button
              onClick={() => handleSelectTheme('dark-emerald')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                currentTheme === 'dark-emerald'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Tema Escuro 🌙</span>
            </button>
          </div>
        </div>

        {/* Scrollable Theme Cards Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AVAILABLE_THEMES.map((theme) => {
              const isActive = currentTheme === theme.id;
              const isLight = theme.mode === 'light';

              return (
                <div
                  key={theme.id}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                    isActive
                      ? 'bg-purple-950/20 border-purple-500 ring-2 ring-purple-500/40 shadow-xl shadow-purple-950/30'
                      : 'bg-black/30 border-white/10 hover:border-white/20 hover:bg-black/40'
                  }`}
                >
                  {/* Theme Card Top */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{theme.emoji}</span>
                        <div className="min-w-0">
                          <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                            {theme.name}
                          </h3>
                          <span
                            className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded inline-block ${
                              isLight
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {isLight ? 'Modo Claro ☀️' : 'Modo Escuro 🌙'}
                          </span>
                        </div>
                      </div>

                      {isActive && (
                        <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug mb-3">
                      {theme.tagline}
                    </p>
                  </div>

                  {/* Visual Layout Mockup Preview */}
                  <div
                    className="p-2.5 rounded-xl border flex flex-col gap-1.5 transition-transform group-hover:scale-[1.01]"
                    style={{
                      backgroundColor: theme.bgHex,
                      borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    {/* Mock header */}
                    <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)' }}>
                      <div className="w-12 h-2 rounded" style={{ backgroundColor: theme.accentColor }} />
                      <div className="w-6 h-2 rounded" style={{ backgroundColor: isLight ? '#CBD5E1' : '#334155' }} />
                    </div>

                    {/* Mock cards row */}
                    <div className="grid grid-cols-2 gap-1.5">
                      <div
                        className="p-1.5 rounded-lg border flex flex-col gap-1"
                        style={{
                          backgroundColor: theme.cardHex,
                          borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <span className="text-[8px] font-bold block" style={{ color: theme.accentColor }}>
                          Saldo
                        </span>
                        <span className="text-[10px] font-extrabold font-mono block" style={{ color: theme.textHex }}>
                          R$ 4.500
                        </span>
                      </div>

                      <div
                        className="p-1.5 rounded-lg border flex flex-col gap-1"
                        style={{
                          backgroundColor: theme.cardHex,
                          borderColor: isLight ? '#E2E8F0' : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <span className="text-[8px] font-bold block" style={{ color: '#F43F5E' }}>
                          Gastos
                        </span>
                        <span className="text-[10px] font-extrabold font-mono block" style={{ color: theme.textHex }}>
                          R$ 1.250
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-white/10 bg-[#10141e] shrink-0 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Tema ativo atual:{' '}
            <strong className="text-white font-bold">{activeThemeObj.name}</strong>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-950/40 active:scale-95"
          >
            Pronto / Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
