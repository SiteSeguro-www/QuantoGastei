/**
 * PWA Utility functions
 * Provides centralized detection of installation status, platforms, and standalone mode.
 */

export interface NavigatorStandalone {
  standalone?: boolean;
}

/**
 * Centralized function to determine whether the app is running as an installed PWA.
 * Checks both Chromium/Desktop `display-mode: standalone` media query and
 * iOS Safari `window.navigator.standalone`.
 */
export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;

  const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
  const isIOSStandalone = (window.navigator as unknown as NavigatorStandalone).standalone === true;
  const isTWA = document.referrer.includes('android-app://');

  return isStandaloneMedia || isIOSStandalone || isTWA;
}

/**
 * Checks if the current user agent is an Apple iOS/iPadOS device.
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
}

/**
 * Checks if the current browser is Safari on iOS (which does not support beforeinstallprompt).
 */
export function isIOSSafari(): boolean {
  if (!isIOSDevice()) return false;
  const ua = window.navigator.userAgent.toLowerCase();
  // Safari check (not Chrome, Firefox or other iOS browsers)
  return /safari/.test(ua) && !/crios|fxios|opios|mercury/.test(ua);
}
