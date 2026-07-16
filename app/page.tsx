'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfiles } from '@/lib/profile-context';
import { useT } from '@/lib/i18n';
import { getActivityDates, getTotalCorrect } from '@/lib/repo';
import { currentStreak } from '@/lib/badges';
import { Button } from '@/components/Button';
import { Kalk } from '@/components/Kalk';
import { PlayerCard } from '@/components/PlayerCard';

export default function ProfileSelectPage() {
  const router = useRouter();
  const t = useT();
  const { profiles, loading, select } = useProfiles();
  const [streaks, setStreaks] = useState<Record<number, number>>({});
  const [correctCounts, setCorrectCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        profiles.map(async (p) => [p.id!, currentStreak(await getActivityDates(p.id!))] as const),
      );
      if (!cancelled) setStreaks(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [profiles]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        profiles.map(async (p) => [p.id!, await getTotalCorrect(p.id!)] as const),
      );
      if (!cancelled) setCorrectCounts(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [profiles]);

  const choose = (id: number) => {
    select(id);
    router.push('/config');
  };

  const streakLabel = (days: number) => {
    if (days >= 2) return t('profile.select.streakDays', { days });
    if (days === 1) return t('profile.select.streakOneDay');
    return undefined;
  };

  return (
    <main className="mx-auto flex w-full max-w-[420px] flex-1 items-center justify-center px-5 py-10 sm:max-w-[560px] lg:max-w-[720px]">
      <div className="flex w-full max-w-[390px] flex-col overflow-hidden rounded-[44px] bg-white shadow-[0_30px_70px_-20px_rgba(30,58,138,0.4)] sm:max-w-[520px] lg:max-w-[680px]">
        {/* Night panel — logo, score-free header, Kalk */}
        <div
          className="relative h-[330px] overflow-hidden px-6 pt-[22px]"
          style={{ background: 'linear-gradient(165deg,#1e293b 0%,#312e81 100%)' }}
        >
          <div
            className="pointer-events-none absolute left-1/2 top-[70px] h-[210px] w-[210px] -translate-x-1/2 rounded-full"
            style={{ background: 'radial-gradient(circle,rgba(52,211,153,0.22) 0%,transparent 62%)' }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px,transparent 1px)',
              backgroundSize: '26px 26px',
            }}
          />
          <div className="relative flex items-center gap-2">
            <span className="text-xl text-yellow-400" aria-hidden>
              ✦
            </span>
            <span className="text-[22px] font-extrabold tracking-tight text-white">
              {t('app.title')}
            </span>
          </div>
          <div className="pointer-events-none absolute inset-x-0 -bottom-1 flex justify-center">
            <Kalk />
          </div>
        </div>

        {/* Profile panel */}
        <div className="flex flex-1 flex-col p-6">
          <div className="text-center">
            <h1 className="text-[22px] font-extrabold text-slate-900">
              {t('profile.select.title')}
            </h1>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-slate-500">
              {t('profile.select.subtitle')}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-3">
            {loading ? (
              <p className="py-6 text-center text-slate-400">…</p>
            ) : profiles.length === 0 ? (
              <p className="py-6 text-center text-slate-400">{t('profile.select.empty')}</p>
            ) : (
              profiles.map((p) => (
                <PlayerCard
                  key={p.id}
                  avatar={p.avatar}
                  name={p.name}
                  streakLabel={streakLabel(streaks[p.id!] ?? 0)}
                  correctCount={correctCounts[p.id!] ?? 0}
                  onPlay={() => choose(p.id!)}
                  onAvatarClick={() => router.push(`/profil/${p.id}`)}
                  avatarLabel={t('profile.edit.avatarButtonLabel', { name: p.name })}
                />
              ))
            )}
          </div>

          <div className="flex-1" />

          <Button
            variant="ghost"
            className="mt-5"
            onClick={() => router.push('/profil/nouveau')}
          >
            ＋ {t('profile.select.add')}
          </Button>
        </div>
      </div>
    </main>
  );
}
