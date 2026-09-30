import { useEffect, useState, useCallback } from 'react';
import { isAppInstalled, isIOSDevice } from '../utils/pwa';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global window event holder so prompt is not lost across component remounts
let deferredPromptGlobal: BeforeInstallPromptEvent | null = null;
const promptListeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPromptGlobal = e as BeforeInstallPromptEvent;
    promptListeners.forEach((listener) => listener(deferredPromptGlobal));
  });

  window.addEventListener('appinstalled', () => {
    deferredPromptGlobal = null;
    promptListeners.forEach((listener) => listener(null));
  });
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => deferredPromptGlobal);
  const [isInstalled, setIsInstalled] = useState<boolean>(() => isAppInstalled());
  const [isIOS, setIsIOS] = useState<boolean>(() => isIOSDevice());
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  useEffect(() => {
    // Check initial install status
    setIsInstalled(isAppInstalled());
    setIsIOS(isIOSDevice());

    const updatePrompt = (prompt: BeforeInstallPromptEvent | null) => {
      setDeferredPrompt(prompt);
      setIsInstalled(isAppInstalled());
    };

    promptListeners.add(updatePrompt);

    // Watch for standalone changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleMediaChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches || isAppInstalled());
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaChange);
    } else {
      mediaQuery.addListener(handleMediaChange);
    }

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      promptListeners.delete(updatePrompt);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaChange);
      } else {
        mediaQuery.removeListener(handleMediaChange);
      }
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<boolean> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          deferredPromptGlobal = null;
          setDeferredPrompt(null);
          return true;
        }
        return false;
      } catch (err) {
        console.error('Error during PWA installation:', err);
        return false;
      }
    }

    // If iOS, open the guide
    if (isIOS) {
      setShowIOSGuide(true);
      return false;
    }

    return false;
  }, [deferredPrompt, isIOS]);

  const platform: 'installed' | 'chromium' | 'ios' | 'unsupported' = isInstalled
    ? 'installed'
    : deferredPrompt
    ? 'chromium'
    : isIOS
    ? 'ios'
    : 'unsupported';

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    showIOSGuide,
    setShowIOSGuide,
    install,
    platform,
  };
}
