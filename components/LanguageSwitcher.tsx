'use client';

import { Locale, LOCALE_LABELS, SUPPORTED_LOCALES, useI18n } from '@/lib/i18n';

/**
 * Compact language picker. A plain `<select>` scales to any number of
 * languages without redesign, unlike a row of toggle buttons.
 * @category Actions
 */
export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useI18n();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      aria-label="Language / Langue"
      className={`rounded-lg bg-white/10 px-2 py-1 text-xs font-bold text-white outline-none ${className}`}
    >
      {SUPPORTED_LOCALES.map((l) => (
        <option key={l} value={l} className="text-slate-800">
          {LOCALE_LABELS[l]}
        </option>
      ))}
    </select>
  );
}
