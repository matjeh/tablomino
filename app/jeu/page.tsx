'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveSession } from '@/lib/active-session';
import { useT } from '@/lib/i18n';
import { buildChoices } from '@/lib/distractors';
import { finalizeSession } from '@/lib/game-flow';
import { QuestionCard } from '@/components/QuestionCard';
import { MultipleChoice } from '@/components/MultipleChoice';
import { NumericKeypad } from '@/components/NumericKeypad';
import { FeedbackOverlay } from '@/components/FeedbackOverlay';

export default function GamePage() {
  const router = useRouter();
  const t = useT();
  const session = useActiveSession();
  const { current, config, status, answered, total } = session;

  const [phase, setPhase] = useState<'answering' | 'feedback'>('answering');
  const [submitted, setSubmitted] = useState<number | null>(null);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [entry, setEntry] = useState('');
  const finalizedRef = useRef(false);

  const isMcq = config?.difficulty === 1;
  const choices = useMemo(
    () => (current ? buildChoices(current.answer) : []),
    [current],
  );

  // No active session (e.g. refresh / deep link) -> back to config.
  useEffect(() => {
    if (status === 'idle') router.replace('/config');
  }, [status, router]);

  // Finished -> persist, score, award badges, go to bilan (once).
  useEffect(() => {
    if (status !== 'finished' || finalizedRef.current || !config) return;
    finalizedRef.current = true;
    (async () => {
      const result = await finalizeSession(
        config,
        session.updatedFacts,
        session.correctCount,
        session.total,
        session.divisionSuccess,
      );
      session.setResult(result);
      router.replace('/bilan');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  if (status !== 'playing' || !current) {
    return <main className="flex flex-1 items-center justify-center text-slate-300">…</main>;
  }

  const reveal = (value: number) => {
    if (phase !== 'answering') return;
    setSubmitted(value);
    setLastCorrect(value === current.answer);
    setPhase('feedback');
  };

  const cont = () => {
    session.answer(lastCorrect);
    setSubmitted(null);
    setEntry('');
    setPhase('answering');
  };

  const quit = () => {
    if (confirm(t('game.quitConfirm'))) {
      session.reset();
      router.replace('/config');
    }
  };

  const progressPct = (answered / total) * 100;

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-5 py-6">
      {/* Top bar: progress + quit */}
      <div className="flex items-center gap-4">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <button
          onClick={quit}
          className="text-sm font-semibold text-slate-400 hover:text-slate-600"
        >
          {t('game.quit')}
        </button>
      </div>
      <p className="text-center text-sm font-bold text-slate-400">
        {t('game.progress', { current: Math.min(answered + 1, total), total })}
      </p>

      {/* Question */}
      <div key={answered} className="animate-pop-in rounded-3xl bg-white/80 px-4 py-10 shadow-lg shadow-violet-500/5 ring-1 ring-white">
        <QuestionCard
          prompt={current.prompt}
          pending={
            phase === 'feedback' && submitted !== null
              ? String(submitted)
              : isMcq
                ? undefined
                : entry
          }
          state={phase === 'feedback' ? (lastCorrect ? 'correct' : 'wrong') : 'idle'}
        />
      </div>

      {/* Input or feedback */}
      <div className="mt-2">
        {phase === 'feedback' ? (
          <FeedbackOverlay
            state={lastCorrect ? 'correct' : 'wrong'}
            answer={current.answer}
            onNext={cont}
          />
        ) : isMcq ? (
          <MultipleChoice
            choices={choices}
            answer={current.answer}
            picked={null}
            onPick={reveal}
          />
        ) : (
          <NumericKeypad
            value={entry}
            onChange={setEntry}
            onSubmit={() => reveal(Number(entry))}
            submitLabel={t('game.validate')}
          />
        )}
      </div>
    </main>
  );
}
