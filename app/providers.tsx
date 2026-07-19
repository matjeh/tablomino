'use client';

import { ReactNode, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { I18nProvider } from '@/lib/i18n';
import { ProfileProvider } from '@/lib/profile-context';
import { ActiveSessionProvider } from '@/lib/active-session';

/**
 * Registers the service worker for offline/PWA support. Skipped inside a
 * Capacitor native shell: the whole build is already bundled into the app
 * package, so there's nothing to be offline-first about, and a registered
 * SW risks serving stale content across app-binary updates.
 */
function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    if (process.env.NODE_ENV !== 'production') return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* offline support is best-effort */
    });
  }, []);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ProfileProvider>
        <ActiveSessionProvider>
          <ServiceWorkerRegistrar />
          {children}
        </ActiveSessionProvider>
      </ProfileProvider>
    </I18nProvider>
  );
}
