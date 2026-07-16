'use client';

import { useT } from '@/lib/i18n';
import { avatarAccent } from '@/lib/ui';
import { Button } from './Button';

/**
 * A player's row on the home screen: a tappable avatar (opens profile
 * management), name, streak, lifetime correct-answer count, and a direct
 * "play" action.
 * @category Game
 */
export function PlayerCard({
  avatar,
  name,
  streakLabel,
  correctCount,
  onPlay,
  onAvatarClick,
  avatarLabel,
}: {
  avatar: string;
  name: string;
  streakLabel?: string;
  correctCount: number;
  onPlay: () => void;
  onAvatarClick: () => void;
  avatarLabel?: string;
}) {
  const t = useT();
  const { gradient, ring } = avatarAccent(avatar);

  return (
    <div
      className="relative flex items-center gap-3 rounded-[20px] border-2 bg-slate-50 p-3"
      style={{ borderColor: ring }}
    >
      <button
        type="button"
        onClick={onAvatarClick}
        aria-label={avatarLabel}
        className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full text-[22px] transition active:scale-95"
        style={{ background: gradient }}
      >
        {avatar}
      </button>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[15px] font-bold text-slate-700">{name}</div>
        {streakLabel && (
          <div className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-amber-500">
            <span aria-hidden>🔥</span>
            <span>{streakLabel}</span>
          </div>
        )}
      </div>
      <Button size="sm" onClick={onPlay}>
        {t('profile.select.play')}
      </Button>
      <div
        className="absolute -right-1.5 -top-1.5 flex items-center gap-0.5 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-amber-500 shadow-sm ring-1 ring-amber-100"
        title={t('profile.select.correctAnswers', { count: correctCount })}
      >
        <span aria-hidden>⭐</span>
        <span>{correctCount}</span>
      </div>
    </div>
  );
}
