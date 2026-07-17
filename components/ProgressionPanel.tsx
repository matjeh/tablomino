'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/lib/i18n';
import { getEarnedBadgeIds, loadFullUniverse } from '@/lib/repo';
import { allBadgeIds } from '@/lib/badges';
import { OPERATION_META, BOX_BG } from '@/lib/ui';
import { Box, Fact, OPERATION_SYMBOL, OPERATIONS, Operation } from '@/lib/types';
import { BadgeGrid } from './Badge';
import { PythagoreGrid } from './PythagoreGrid';

// Widest grid so kids see the whole map filling up.
const GRID_DIFFICULTY = 3;

/**
 * For addition only, collapses the huge (a, b) space down to a 10x10 grid
 * keyed by each operand's last digit — a bucket is only as strong as its
 * weakest contributing fact, mirroring "table mastered" meaning every real
 * fact sharing that digit is mastered (lib/badges.ts's `tablesMastered`).
 * Other operations pass through unchanged.
 */
function forDisplay(operation: Operation, facts: Fact[]): Fact[] {
  if (operation !== 'addition') return facts;
  const buckets = new Map<string, Fact[]>();
  for (const f of facts) {
    const key = `${f.a % 10}:${f.b % 10}`;
    const list = buckets.get(key) ?? [];
    list.push(f);
    buckets.set(key, list);
  }
  return [...buckets.entries()].map(([key, list]) => {
    const [a, b] = key.split(':').map(Number);
    const box = list.reduce<Box>((min, f) => (f.box < min ? f.box : min), list[0].box);
    return { ...list[0], a, b, box };
  });
}

/** Fetches + renders one operation's grid and badges. Remounted (via `key`)
 * on every tab switch, so "loading" is just its natural initial state —
 * no imperative reset needed. */
function OperationProgress({
  profileId,
  operation,
}: {
  profileId: number;
  operation: Operation;
}) {
  const t = useT();
  const [facts, setFacts] = useState<Fact[]>([]);
  const [earned, setEarned] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [universe, earnedIds] = await Promise.all([
        loadFullUniverse(profileId, operation, GRID_DIFFICULTY),
        getEarnedBadgeIds(profileId),
      ]);
      if (cancelled) return;
      setFacts(universe);
      setEarned(new Set(earnedIds));
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [profileId, operation]);

  if (!ready) return <p className="py-6 text-center text-slate-300">…</p>;

  return (
    <>
      <section className="rounded-3xl bg-white/80 p-5 shadow-lg ring-1 ring-white">
        <PythagoreGrid facts={forDisplay(operation, facts)} symbol={OPERATION_SYMBOL[operation]} />
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {([0, 1, 2, 3] as Box[]).map((b) => (
            <div key={b} className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
              <span className={`inline-block h-4 w-4 rounded ${BOX_BG[b]}`} />
              {t(`progression.legend.${b}`)}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-black text-slate-700">{t('progression.badges')}</h2>
        <BadgeGrid allIds={allBadgeIds(operation, GRID_DIFFICULTY)} earnedIds={earned} />
      </section>
    </>
  );
}

/**
 * Progress grid + badge gallery for one profile, with a 4-way operation tab
 * row on top (a session can span every operation now, so all 4 need to stay
 * reachable, not just whichever was used most recently).
 * @category Progression
 */
export function ProgressionPanel({
  profileId,
  initialOperation = 'multiplication',
}: {
  profileId: number;
  initialOperation?: Operation;
}) {
  const t = useT();
  const [operation, setOperation] = useState<Operation>(initialOperation);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-4 gap-2">
        {OPERATIONS.map((op) => (
          <button
            key={op}
            type="button"
            onClick={() => setOperation(op)}
            aria-label={t(`op.${op}`)}
            className={`flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1 py-3 text-[0.7rem] font-bold transition sm:px-2 sm:text-xs ${
              operation === op
                ? 'bg-gradient-to-r ' + OPERATION_META[op].accent + ' text-white shadow-md'
                : 'bg-white text-slate-600 ring-2 ring-slate-200'
            }`}
          >
            <span className="text-2xl sm:text-lg" aria-hidden>
              {OPERATION_META[op].emoji}
            </span>
            <span className="hidden w-full break-words text-center leading-tight hyphens-auto sm:block">
              {t(`op.${op}`)}
            </span>
          </button>
        ))}
      </div>

      <OperationProgress key={operation} profileId={profileId} operation={operation} />
    </div>
  );
}
