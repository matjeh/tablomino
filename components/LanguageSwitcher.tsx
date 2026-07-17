'use client';

import { useEffect, useRef, useState } from 'react';
import { LOCALE_LABELS, SUPPORTED_LOCALES, useI18n } from '@/lib/i18n';

/**
 * Compact language picker with a custom-styled open panel (native `<select>`
 * dropdowns render with unstyleable OS chrome). Scales to any number of
 * languages without redesign. `className` positions the whole widget (e.g.
 * `fixed bottom-4 right-4`); the inner wrapper keeps its own `relative` so
 * the two positioning concerns never collide on one element.
 * @category Actions
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  return (
    <div className={className}>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="listbox"
          aria-expanded={open}
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-lg ring-2 ring-slate-200 transition hover:ring-violet-300"
        >
          <span aria-hidden>🌐</span>
          {LOCALE_LABELS[locale]}
          <span aria-hidden className={`text-xs transition-transform ${open ? 'rotate-180' : ''}`}>
            ▾
          </span>
        </button>

        {open && (
          <div
            role="listbox"
            className="absolute bottom-full right-0 z-20 mb-2 max-h-72 w-44 overflow-y-auto rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-slate-200"
          >
            {SUPPORTED_LOCALES.map((l) => (
              <button
                key={l}
                type="button"
                role="option"
                aria-selected={l === locale}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-bold transition ${
                  l === locale
                    ? 'bg-violet-100 text-violet-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {LOCALE_LABELS[l]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
