'use client';

import { ReactNode, useEffect } from 'react';
import { I18nProvider } from '@/lib/i18n';
import { ProfileProvider } from '@/lib/profile-context';
import { ActiveSessionProvider } from '@/lib/active-session';

/** Registers the service worker for offline/PWA support (browser only). */
function ServiceWorkerRegistrar() {
  useEffect(() => {
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
    <I18nProvider initialLocale="fr">
      <ProfileProvider>
        <ActiveSessionProvider>
          <ServiceWorkerRegistrar />
          {children}
        </ActiveSessionProvider>
      </ProfileProvider>
    </I18nProvider>
  );
}
