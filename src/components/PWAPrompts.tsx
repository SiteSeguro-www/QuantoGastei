import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { WifiOff, Wifi, RefreshCw, Share, PlusSquare, CheckCircle, X, Download } from 'lucide-react';

/**
 * Offline and Connection Restored Status Indicator
 */
export const OfflineIndicator: React.FC = () => {
  const { isOnline, showRestoredNotice } = useOnlineStatus();

  if (isOnline && !showRestoredNotice) {
    return null;
  }

  if (!isOnline) {
    return (
      <aside
        aria-label="Aviso de conexão offline"
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-amber-950/90 text-amber-200 border border-amber-500/40 shadow-xl backdrop-blur-md text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-auto"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
        <WifiOff className="w-4 h-4 text-amber-300 shrink-0" />
        <span>Você está offline — Usando dados locais com segurança</span>
      </aside>
    );
  }

  if (showRestoredNotice) {
    return (
      <aside
        aria-label="Aviso de conexão restaurada"
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-emerald-950/90 text-emerald-200 border border-emerald-500/40 shadow-xl backdrop-blur-md text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-200"
      >
        <Wifi className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>Conexão restaurada</span>
      </aside>
    );
  }

  return null;
};

/**
 * iOS Safari Add to Home Screen Instructions Modal
 */
export const IOSInstallModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl bg-[#121622] border border-white/10 p-6 shadow-2xl text-slate-100 relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-950/40 shrink-0">
            <div className="w-full h-full rounded-2xl bg-[#090A0F] flex items-center justify-center text-xl">
              💰
            </div>
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Instale o app na sua tela inicial</h3>
            <p className="text-xs text-slate-400">QuantoGastei no iPhone & iPad</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Para instalar sem precisar da App Store, siga 3 passos simples no navegador Safari:
        </p>

        <div className="space-y-3 bg-black/30 p-3.5 rounded-2xl border border-white/5 text-xs text-slate-300">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <span>Toque no botão </span>
              <strong className="text-white inline-flex items-center gap-1 font-semibold">
                Compartilhar <Share className="w-3.5 h-3.5 inline text-sky-400" />
              </strong>
              <span> na barra inferior do Safari.</span>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <span>Role o menu para baixo e selecione </span>
              <strong className="text-white inline-flex items-center gap-1 font-semibold">
                "Adicionar à Tela de Início" <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400" />
              </strong>.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div>
              <span>Toque em </span>
              <strong className="text-white font-semibold">Adicionar</strong>
              <span> no canto superior direito para confirmar a instalação.</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
        >
          Entendi, vou instalar
        </button>
      </div>
    </div>
  );
};

/**
 * Service Worker Update Toast Notification
 */
export const PWAUpdateNotification: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [updateSWFn, setUpdateSWFn] = useState<(() => Promise<void>) | null>(null);

  useEffect(() => {
    // Dynamically register SW listener if available
    let isCancelled = false;

    async function initSW() {
      try {
        const { registerSW } = await import('virtual:pwa-register');
        const update = registerSW({
          onNeedRefresh() {
            if (!isCancelled) {
              setNeedRefresh(true);
            }
          },
          onOfflineReady() {
            // App is ready for offline usage
          },
        });
        if (!isCancelled) {
          setUpdateSWFn(() => update);
        }
      } catch {
        // Dev environment or unsupported service worker
      }
    }

    initSW();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleUpdate = () => {
    if (updateSWFn) {
      updateSWFn();
    } else {
      window.location.reload();
    }
  };

  if (!needRefresh) return null;

  return (
    <aside
      aria-label="Aviso de nova versão disponível"
      className="fixed top-16 md:top-6 right-4 z-50 max-w-sm w-full p-4 rounded-2xl bg-[#121622]/95 border border-emerald-500/40 text-slate-100 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <RefreshCw className="w-5 h-5 animate-spin" />
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-white">Uma nova versão está disponível.</h4>
          <p className="text-[11px] text-slate-400 truncate">Clique para carregar as melhorias recentes</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleUpdate}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow transition-all active:scale-95"
        >
          Atualizar agora
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          aria-label="Dispensar aviso de atualização"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
};
