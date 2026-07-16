'use client';

import { BLANK } from '@/lib/format';

/**
 * Renders a prompt like "7 × ? = 56", showing the blank as a highlighted slot.
 * While typing (keypad), `pending` fills the slot; `state` tints it after check.
 * @category Game
 */
export function QuestionCard({
  prompt,
  pending,
  state = 'idle',
}: {
  prompt: string;
  pending?: string;
  state?: 'idle' | 'correct' | 'wrong';
}) {
  const [before, after] = prompt.split(BLANK);
  const slotText = pending && pending.length > 0 ? pending : BLANK;

  const slotColor =
    state === 'correct'
      ? 'bg-emerald-100 text-emerald-700 ring-emerald-300'
      : state === 'wrong'
        ? 'bg-rose-50 text-rose-600 ring-rose-200'
        : pending
          ? 'bg-violet-100 text-violet-700 ring-violet-300'
          : 'bg-slate-100 text-slate-400 ring-slate-200';

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 text-5xl font-black tracking-tight sm:text-6xl">
      <span>{before}</span>
      <span
        className={`inline-flex min-w-[1.6em] items-center justify-center rounded-2xl px-3 py-1 ring-4 transition ${slotColor}`}
      >
        {slotText}
      </span>
      <span>{after}</span>
    </div>
  );
}
