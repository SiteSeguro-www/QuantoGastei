import React from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Monitor, CheckCircle, Download, Sparkles, ExternalLink, HelpCircle } from 'lucide-react';
import { IOSInstallModal } from './PWAPrompts';

export const PWAInstallSection: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, showIOSGuide, setShowIOSGuide, install } = usePWAInstall();

  return (
    <div className="p-5 rounded-2xl bg-[#121622]/90 border border-white/[0.07] space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">
              Configurações → Aplicativo
            </span>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              📱 QuantoGastei (Meu Financeiro)
            </h3>
          </div>
        </div>

        {isInstalled && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
            <CheckCircle className="w-3.5 h-3.5" />
            App Instalado
          </span>
        )}
      </div>

      <p className="text-xs text-slate-300 leading-relaxed">
        <strong className="text-white font-semibold">Tenha seu controle financeiro sempre à mão.</strong>{' '}
        Instale o aplicativo no seu dispositivo para acessar seus gastos de forma rápida, segura e sem depender de abas do navegador.
      </p>

      {/* State A: Already Installed */}
      {isInstalled ? (
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <CheckCircle className="w-4 h-4" />
            <span>Você já está executando o QuantoGastei instalado!</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            O aplicativo está configurado em modo standalone com inicialização instantânea, atalhos de sistema e cache local seguro.
          </p>
        </div>
      ) : (
        /* State B: Can Install or iOS / Desktop */
        <div className="space-y-3">
          {/* Action button */}
          <button
            onClick={install}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:brightness-110 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950/40 active:scale-[0.99] transition-all"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>📲 Instalar aplicativo</span>
          </button>

          {/* Browser note */}
          <div className="flex items-center justify-center gap-2 text-center">
            <span className="text-[11px] text-slate-400">
              Disponível para celular e computador através do navegador.
            </span>
          </div>

          {/* Compatibility hints */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
            <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 flex items-center gap-2 text-slate-300">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">Android & iPhone</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/20 border border-white/5 flex items-center gap-2 text-slate-300">
              <Monitor className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="truncate">Chrome & Edge Desktop</span>
            </div>
          </div>

          {/* iOS Safari manual guide trigger if on iOS */}
          {isIOS && (
            <button
              onClick={() => setShowIOSGuide(true)}
              className="w-full py-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 text-xs text-sky-400 font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Como adicionar à Tela de Início no iPhone/iPad?</span>
            </button>
          )}
        </div>
      )}

      {/* iOS Modal */}
      <IOSInstallModal isOpen={showIOSGuide} onClose={() => setShowIOSGuide(false)} />
    </div>
  );
};

/**
 * Compact Install Button for Header / Sidebar
 */
export const PWACompactInstallButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { isInstalled, isInstallable, isIOS, install, showIOSGuide, setShowIOSGuide } = usePWAInstall();

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        onClick={install}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all active:scale-95 ${className}`}
        title="Instalar QuantoGastei no seu dispositivo"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>

      <IOSInstallModal isOpen={showIOSGuide} onClose={() => setShowIOSGuide(false)} />
    </>
  );
};
