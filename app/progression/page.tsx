'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfiles } from '@/lib/profile-context';
import { useT } from '@/lib/i18n';
import { getRecentSessions, getSettings } from '@/lib/repo';
import { GameSession, SessionConfig } from '@/lib/types';
import { ProgressionPanel } from '@/components/ProgressionPanel';
import { SessionHistoryChart } from '@/components/SessionHistoryChart';
import { Button } from '@/components/Button';

export default function ProgressionPage() {
  const router = useRouter();
  const t = useT();
  const { current, loading } = useProfiles();
  const [settings, setSettings] = useState<SessionConfig | null>(null);
  const [sessions, setSessions] = useState<GameSession[] | null>(null);

  useEffect(() => {
    if (!loading && !current) router.replace('/');
  }, [loading, current, router]);

  useEffect(() => {
    if (!current) return;
    getSettings(current.id!).then(setSettings);
    getRecentSessions(current.id!, 20).then(setSessions);
  }, [current]);

  if (loading || !current || !settings || !sessions) {
    return <main className="flex flex-1 items-center justify-center text-slate-300">…</main>;
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-5 py-8 sm:max-w-2xl lg:max-w-4xl">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/config')}
          className="text-sm font-semibold text-slate-400 hover:text-slate-600"
        >
          ← {t('common.back')}
        </button>
        <button
          onClick={() => router.push('/')}
          className="text-sm font-semibold text-slate-400 hover:text-slate-600"
        >
          🏠 {t('common.home')}
        </button>
      </div>

      <header>
        <h1 className="text-3xl font-black text-slate-700">{t('progression.title')}</h1>
        <p className="mt-1 font-semibold text-slate-400">{t('progression.subtitle')}</p>
      </header>

      <SessionHistoryChart sessions={sessions} />

      <ProgressionPanel profileId={current.id!} initialOperation={settings.operations[0]} />

      <Button onClick={() => router.push('/config')} className="w-full">
        {t('progression.play')} ▶
      </Button>
    </main>
  );
}
