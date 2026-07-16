'use client';

import { badgeInfo } from '@/lib/badges';
import { useT } from '@/lib/i18n';

/** Single earned/locked achievement badge, with emoji and title. @category Badges */
export function BadgeChip({
  id,
  earned = true,
  size = 'md',
}: {
  id: string;
  earned?: boolean;
  size?: 'md' | 'lg';
}) {
  const t = useT();
  const info = badgeInfo(id);
  const big = size === 'lg';

  return (
    <div
      className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-center transition ${
        earned
          ? 'bg-white ring-2 ring-amber-200 shadow-sm'
          : 'bg-slate-50 ring-2 ring-slate-100'
      }`}
      title={t(info.descKey, info.params)}
    >
      <span
        className={`${big ? 'text-5xl' : 'text-3xl'} ${earned ? '' : 'grayscale opacity-40'}`}
        aria-hidden
      >
        {info.emoji}
      </span>
      <span
        className={`text-xs font-bold ${earned ? 'text-slate-700' : 'text-slate-400'}`}
      >
        {earned ? t(info.titleKey, info.params) : t('badge.locked')}
      </span>
    </div>
  );
}

/** Grid of all badges for an operation, earned ones highlighted. @category Badges */
export function BadgeGrid({
  allIds,
  earnedIds,
}: {
  allIds: string[];
  earnedIds: Set<string>;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {allIds.map((id) => (
        <BadgeChip key={id} id={id} earned={earnedIds.has(id)} />
      ))}
    </div>
  );
}
