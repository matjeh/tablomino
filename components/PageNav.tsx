'use client';

import { useRouter } from 'next/navigation';
import { useT } from '@/lib/i18n';
import { Profile } from '@/lib/types';

const ACTIVE =
  'flex items-center gap-1 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-md';
const INACTIVE =
  'flex items-center gap-1 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-2 ring-slate-200 transition hover:ring-violet-300';

/**
 * Shared header for profile-scoped pages: avatar+name identity display on
 * the left, a 3-item Home/Play/Progression icon nav on the right (the
 * current page's item is active/non-clickable). Labels collapse to
 * icon-only below `sm`, matching the operation-tab pattern in
 * ProgressionPanel.
 * @category Navigation
 */
export function PageNav({
  current,
  profile,
}: {
  current: 'config' | 'progression';
  profile: Profile;
}) {
  const router = useRouter();
  const t = useT();

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-3xl" aria-hidden>
          {profile.avatar}
        </span>
        <span className="truncate text-lg font-bold text-slate-600">{profile.name}</span>
      </div>

      <nav className="flex items-center gap-1.5">
        <button type="button" onClick={() => router.push('/')} className={INACTIVE}>
          <span aria-hidden>🏠</span>
          <span className="hidden sm:inline">{t('common.home')}</span>
        </button>

        {current === 'config' ? (
          <span className={ACTIVE} aria-current="page">
            <span aria-hidden>▶</span>
            <span className="hidden sm:inline">{t('progression.play')}</span>
          </span>
        ) : (
          <button type="button" onClick={() => router.push('/config')} className={INACTIVE}>
            <span aria-hidden>▶</span>
            <span className="hidden sm:inline">{t('progression.play')}</span>
          </button>
        )}

        {current === 'progression' ? (
          <span className={ACTIVE} aria-current="page">
            <span aria-hidden>📊</span>
            <span className="hidden sm:inline">{t('config.progress')}</span>
          </span>
        ) : (
          <button type="button" onClick={() => router.push('/progression')} className={INACTIVE}>
            <span aria-hidden>📊</span>
            <span className="hidden sm:inline">{t('config.progress')}</span>
          </button>
        )}
      </nav>
    </div>
  );
}
