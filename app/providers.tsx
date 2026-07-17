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

/**
 * Asks the browser not to silently evict this origin's IndexedDB data under
 * storage pressure (Android can otherwise clear "best-effort" storage for
 * rarely-used origins). Standard web storage, unaffected by app updates.
 */
function PersistentStorageRequest() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.storage?.persist) return;
    navigator.storage.persist().catch(() => {
      /* best-effort; the app still works without it */
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
          <PersistentStorageRequest />
          {children}
        </ActiveSessionProvider>
      </ProfileProvider>
    </I18nProvider>
  );
}
