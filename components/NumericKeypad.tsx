'use client';

/**
 * Giant numeric keypad for levels 2-3. Emits the current entry; the parent
 * owns the value and validation.
 * @category Inputs
 */
export function NumericKeypad({
  value,
  onChange,
  onSubmit,
  disabled = false,
  submitLabel,
}: {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  submitLabel: string;
}) {
  const press = (digit: string) => {
    if (disabled) return;
    if (value.length >= 4) return;
    onChange((value === '0' ? '' : value) + digit);
  };
  const backspace = () => {
    if (disabled) return;
    onChange(value.slice(0, -1));
  };

  const keyClass =
    'flex items-center justify-center rounded-2xl bg-white text-3xl font-extrabold text-slate-700 ring-2 ring-slate-200 shadow-sm transition active:scale-95 hover:bg-slate-50 disabled:opacity-40 h-16';

  return (
    <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-3">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <button
          key={n}
          type="button"
          className={keyClass}
          onClick={() => press(String(n))}
          disabled={disabled}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        className={keyClass}
        onClick={backspace}
        disabled={disabled}
        aria-label="Effacer"
      >
        ⌫
      </button>
      <button
        type="button"
        className={keyClass}
        onClick={() => press('0')}
        disabled={disabled}
      >
        0
      </button>
      <button
        type="button"
        className="flex h-16 items-center justify-center rounded-2xl bg-gradient-to-b from-violet-500 to-fuchsia-500 text-lg font-bold text-white shadow-lg shadow-fuchsia-500/30 transition active:scale-95 disabled:opacity-40"
        onClick={onSubmit}
        disabled={disabled || value.length === 0}
      >
        {submitLabel}
      </button>
    </div>
  );
}
