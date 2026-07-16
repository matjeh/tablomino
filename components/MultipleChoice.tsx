'use client';

/**
 * Four big answer buttons for level 1. Highlights right/wrong once locked.
 * @category Inputs
 */
export function MultipleChoice({
  choices,
  answer,
  picked,
  disabled = false,
  onPick,
}: {
  choices: number[];
  answer: number;
  picked: number | null;
  disabled?: boolean;
  onPick: (value: number) => void;
}) {
  return (
    <div className="mx-auto grid w-full max-w-md grid-cols-2 gap-4">
      {choices.map((c) => {
        const locked = picked !== null;
        const isPicked = picked === c;
        const isAnswer = c === answer;

        let tint =
          'bg-white text-slate-800 ring-2 ring-slate-200 hover:ring-violet-300';
        if (locked && isAnswer) {
          tint = 'bg-emerald-100 text-emerald-700 ring-4 ring-emerald-300';
        } else if (locked && isPicked && !isAnswer) {
          tint = 'bg-rose-50 text-rose-600 ring-4 ring-rose-200';
        } else if (locked) {
          tint = 'bg-white text-slate-400 ring-2 ring-slate-100';
        }

        return (
          <button
            key={c}
            type="button"
            disabled={disabled || locked}
            onClick={() => onPick(c)}
            className={`rounded-3xl py-8 text-4xl font-black shadow-sm transition active:scale-95 disabled:cursor-default ${tint}`}
          >
            {c}
          </button>
        );
      })}
    </div>
  );
}
