'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveSession } from '@/lib/active-session';
import { useT } from '@/lib/i18n';
import { buildSessionQuestions } from '@/lib/game-flow';
import { BadgeChip } from '@/components/Badge';
import { Button } from '@/components/Button';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function BilanPage() {
  const router = useRouter();
  const t = useT();
  const { result, config, start } = useActiveSession();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!result) router.replace('/config');
  }, [result, router]);

  if (!result) {
    return <LoadingScreen />;
  }

  const { score, total, newBadges } = result;
  const ratio = total > 0 ? score / total : 0;
  const tier = score === total ? 'perfect' : ratio >= 0.7 ? 'great' : 'good';
  const emoji = tier === 'perfect' ? '🏆' : tier === 'great' ? '🎉' : '💪';

  const replay = async () => {
    if (!config || busy) return;
    setBusy(true);
    const questions = await buildSessionQuestions(config);
    if (questions.length === 0) {
      router.replace('/config');
      return;
    }
    start(config, questions);
    router.push('/jeu');
  };

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center gap-6 px-5 py-10 text-center">
      <div className="animate-burst text-7xl" aria-hidden>
        {emoji}
      </div>
      <h1 className="text-3xl font-black text-slate-700">{t('bilan.title')}</h1>

      <div className="animate-rise rounded-3xl bg-white px-8 py-6 shadow-lg ring-1 ring-white">
        <p className="text-5xl font-black text-violet-600">
          {score}
          <span className="text-2xl text-slate-300"> / {total}</span>
        </p>
        <p className="mt-2 text-lg font-bold text-slate-500">{t(`bilan.${tier}`)}</p>
      </div>

      {newBadges.length > 0 && (
        <section className="w-full animate-rise">
          <h2 className="mb-3 text-lg font-black text-amber-500">
            ✨ {t('bilan.newBadges')}
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {newBadges.map((id) => (
              <BadgeChip key={id} id={id} earned size="lg" />
            ))}
          </div>
        </section>
      )}

      <div className="mt-2 flex w-full flex-col gap-3">
        <Button onClick={replay} disabled={busy} className="w-full">
          {t('bilan.replay')}
        </Button>
        <Button
          variant="secondary"
          onClick={() => router.push('/progression')}
          className="w-full"
        >
          {t('bilan.progress')} 📊
        </Button>
        <Button variant="ghost" onClick={() => router.push('/')} className="w-full">
          {t('bilan.home')}
        </Button>
      </div>
    </main>
  );
}
