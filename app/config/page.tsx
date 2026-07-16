'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfiles } from '@/lib/profile-context';
import { useActiveSession } from '@/lib/active-session';
import { useT } from '@/lib/i18n';
import { getSettings, saveSettings } from '@/lib/repo';
import { availableTables } from '@/lib/facts';
import { buildSessionQuestions } from '@/lib/game-flow';
import { DIFFICULTIES, OPERATION_META, QUESTION_COUNTS } from '@/lib/ui';
import { Difficulty, Format, Operation, OPERATIONS } from '@/lib/types';
import { Button } from '@/components/Button';

function Segment({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex-1 rounded-2xl px-3 py-3 text-center text-sm font-bold transition disabled:opacity-40 ${
        active
          ? 'bg-violet-600 text-white shadow-md'
          : 'bg-white text-slate-600 ring-2 ring-slate-200 hover:ring-violet-300'
      }`}
    >
      {children}
    </button>
  );
}

/** Toggle `item` in/out of `list`, refusing to shrink below `min` items. */
function toggle<T>(list: T[], item: T, min = 1): T[] {
  if (list.includes(item)) {
    return list.length > min ? list.filter((x) => x !== item) : list;
  }
  return [...list, item];
}

export default function ConfigPage() {
  const router = useRouter();
  const t = useT();
  const { current, loading, clearSelection } = useProfiles();
  const { start } = useActiveSession();

  const [operations, setOperations] = useState<Operation[]>(['multiplication']);
  const [formats, setFormats] = useState<Format[]>(['direct']);
  const [difficulty, setDifficulty] = useState<Difficulty>(1);
  const [targetTables, setTargetTables] = useState<number[] | null>(null);
  const [questionCount, setQuestionCount] = useState(10);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  // Redirect out if no profile is selected.
  useEffect(() => {
    if (!loading && !current) router.replace('/');
  }, [loading, current, router]);

  // Load the profile's last-used settings.
  useEffect(() => {
    if (!current) return;
    (async () => {
      const s = await getSettings(current.id!);
      setOperations(s.operations);
      setFormats(s.formats);
      setDifficulty(s.difficulty);
      setTargetTables(s.targetTables);
      setQuestionCount(s.questionCount);
      setReady(true);
    })();
  }, [current]);

  // Only multiplication/division/subtraction have a row/column "table"; addition doesn't.
  const tablesVisible = operations.some((op) => op !== 'addition');
  const tables = availableTables('multiplication', difficulty);

  const toggleOperation = (op: Operation) => {
    const next = toggle(operations, op);
    setOperations(next);
    if (!next.some((o) => o !== 'addition')) setTargetTables(null);
  };
  const toggleFormat = (f: Format) => setFormats(toggle(formats, f));
  const changeDifficulty = (d: Difficulty) => {
    setDifficulty(d);
    setTargetTables(null);
  };
  const toggleTable = (tbl: number) => {
    setTargetTables((prev) => {
      const current = prev ?? [];
      const next = current.includes(tbl)
        ? current.filter((x) => x !== tbl)
        : [...current, tbl];
      return next.length === 0 ? null : next;
    });
  };

  const startGame = async () => {
    if (!current || busy || operations.length === 0 || formats.length === 0) return;
    setBusy(true);
    const config = {
      profileId: current.id!,
      operations,
      formats,
      difficulty,
      targetTables,
      questionCount,
    };
    await saveSettings(config);
    const questions = await buildSessionQuestions(config);
    if (questions.length === 0) {
      setBusy(false);
      return;
    }
    start(config, questions);
    router.push('/jeu');
  };

  if (loading || !current || !ready) {
    return <main className="flex flex-1 items-center justify-center text-slate-300">…</main>;
  }

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-5 py-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl" aria-hidden>
            {current.avatar}
          </span>
          <span className="text-lg font-bold text-slate-600">{current.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/progression')}
            className="text-sm font-semibold text-violet-500 hover:text-violet-700"
          >
            📊 {t('config.progress')}
          </button>
          <button
            onClick={() => {
              clearSelection();
              router.push('/');
            }}
            className="text-sm font-semibold text-slate-400 hover:text-slate-600"
          >
            {t('config.change')}
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-black text-slate-700">{t('config.title')}</h1>

      {/* Operation (multi-select) */}
      <section className="flex flex-col gap-2">
        <span className="font-bold text-slate-600">{t('config.operation')}</span>
        <div className="grid grid-cols-2 gap-3">
          {OPERATIONS.map((op) => {
            const active = operations.includes(op);
            return (
              <button
                key={op}
                type="button"
                onClick={() => toggleOperation(op)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-4 text-left font-bold transition ${
                  active
                    ? 'bg-gradient-to-r ' + OPERATION_META[op].accent + ' text-white shadow-md'
                    : 'bg-white text-slate-600 ring-2 ring-slate-200'
                }`}
              >
                <span className="text-2xl" aria-hidden>
                  {OPERATION_META[op].emoji}
                </span>
                <span className="text-sm">{t(`op.${op}`)}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Format (multi-select) */}
      <section className="flex flex-col gap-2">
        <span className="font-bold text-slate-600">{t('config.format')}</span>
        <div className="flex gap-3">
          {(['direct', 'hole'] as Format[]).map((f) => (
            <Segment key={f} active={formats.includes(f)} onClick={() => toggleFormat(f)}>
              <span className="block">{t(`format.${f}`)}</span>
              <span className="mt-1 block text-xs font-normal opacity-70">
                {t(`format.${f}.example`)}
              </span>
            </Segment>
          ))}
        </div>
      </section>

      {/* Difficulty */}
      <section className="flex flex-col gap-2">
        <span className="font-bold text-slate-600">{t('config.difficulty')}</span>
        <div className="flex gap-3">
          {DIFFICULTIES.map((d) => (
            <Segment key={d} active={difficulty === d} onClick={() => changeDifficulty(d)}>
              <span className="block">{t(`difficulty.${d}`)}</span>
              <span className="mt-1 block text-xs font-normal opacity-70">
                {t(`difficulty.${d}.mult`)}
              </span>
            </Segment>
          ))}
        </div>
      </section>

      {/* Target tables (multi-select; mult/div/subtraction only) */}
      {tablesVisible && (
        <section className="flex flex-col gap-2">
          <span className="font-bold text-slate-600">{t('config.targetTable')}</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTargetTables(null)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
                targetTables === null
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-slate-600 ring-2 ring-slate-200'
              }`}
            >
              {t('config.targetTable.all')}
            </button>
            {tables.map((tbl) => (
              <button
                key={tbl}
                type="button"
                onClick={() => toggleTable(tbl)}
                className={`h-10 w-10 rounded-xl text-sm font-bold transition ${
                  targetTables?.includes(tbl)
                    ? 'bg-violet-600 text-white'
                    : 'bg-white text-slate-600 ring-2 ring-slate-200'
                }`}
              >
                {tbl}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Question count */}
      <section className="flex flex-col gap-2">
        <span className="font-bold text-slate-600">{t('config.questionCount')}</span>
        <div className="flex flex-wrap gap-2">
          {QUESTION_COUNTS.map((n) => (
            <Segment key={n} active={questionCount === n} onClick={() => setQuestionCount(n)}>
              {n}
            </Segment>
          ))}
        </div>
      </section>

      <Button onClick={startGame} disabled={busy} className="mt-2 w-full">
        {t('config.start', { count: questionCount })} ▶
      </Button>
    </main>
  );
}
