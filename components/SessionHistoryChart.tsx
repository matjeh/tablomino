'use client';

import { useState } from 'react';
import { useI18n, useT } from '@/lib/i18n';
import { OPERATION_CHART_COLOR, OPERATION_META } from '@/lib/ui';
import { GameSession, Operation } from '@/lib/types';

const CHART_HEIGHT = 112; // px

/** Equal-width colour stripes, one per operation played in the game. */
function barBackground(operations: Operation[]): string {
  if (operations.length === 1) return OPERATION_CHART_COLOR[operations[0]];
  const n = operations.length;
  const stops = operations.map((op, i) => {
    const color = OPERATION_CHART_COLOR[op];
    return `${color} ${(i / n) * 100}% ${((i + 1) / n) * 100}%`;
  });
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

function GameDetail({
  session,
  onClose,
}: {
  session: GameSession;
  onClose: () => void;
}) {
  const t = useT();
  const { locale } = useI18n();
  const rate = session.total > 0 ? Math.round((session.score / session.total) * 100) : 0;
  const date = new Date(session.playedAt).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-6"
      onClick={onClose}
    >
      <div
        className="animate-pop-in w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl ring-1 ring-white"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-black text-slate-700">{t('progression.history.detail.title')}</h3>
        <p className="mt-1 text-sm font-semibold text-slate-400">
          {t('progression.history.detail.date', { date })}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {session.operations.map((op) => (
            <span
              key={op}
              className="flex items-center gap-1 rounded-xl bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-600 ring-1 ring-slate-100"
            >
              <span aria-hidden>{OPERATION_META[op].emoji}</span>
              {t(`op.${op}`)}
            </span>
          ))}
        </div>
        <p className="mt-4 text-3xl font-black text-violet-600">
          {rate}%
          <span className="block text-sm font-bold text-slate-400">
            {t('progression.history.detail.score', { score: session.score, total: session.total })}
          </span>
        </p>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-600"
        >
          {t('progression.history.close')}
        </button>
      </div>
    </div>
  );
}

/**
 * Success-rate bar chart for the last (up to) 20 games, colour-striped by
 * which operation(s) were played. Clicking a bar shows that game's detail.
 * @category Progression
 */
export function SessionHistoryChart({ sessions }: { sessions: GameSession[] }) {
  const t = useT();
  const [selected, setSelected] = useState<GameSession | null>(null);

  if (sessions.length === 0) {
    return (
      <section className="rounded-3xl bg-white/80 p-5 text-center shadow-lg ring-1 ring-white">
        <h2 className="mb-2 text-lg font-black text-slate-700">{t('progression.history.title')}</h2>
        <p className="text-sm font-semibold text-slate-400">{t('progression.history.empty')}</p>
      </section>
    );
  }

  // Oldest first so the chart reads left-to-right as time passing.
  const ordered = [...sessions].reverse();

  return (
    <section className="rounded-3xl bg-white/80 p-5 shadow-lg ring-1 ring-white">
      <h2 className="mb-4 text-lg font-black text-slate-700">{t('progression.history.title')}</h2>
      <div className="flex items-end gap-1" style={{ height: CHART_HEIGHT }}>
        {ordered.map((session) => {
          const rate = session.total > 0 ? session.score / session.total : 0;
          return (
            <button
              key={session.id}
              type="button"
              onClick={() => setSelected(session)}
              className="group flex h-full flex-1 items-end"
              aria-label={t('progression.history.detail.score', {
                score: session.score,
                total: session.total,
              })}
            >
              <div
                className="w-full rounded-t-md transition group-hover:brightness-110"
                style={{
                  height: `${Math.max(rate * 100, 4)}%`,
                  background: barBackground(session.operations),
                }}
              />
            </button>
          );
        })}
      </div>

      {selected && <GameDetail session={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
