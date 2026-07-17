'use client';

// Lightweight i18n: flat key dictionaries + a `t()` hook.
//
// Adding a new language: drop messages/xx.json (same keys as fr.json), add
// it to DICTS, add 'xx' to SUPPORTED_LOCALES, and give it a native-name entry
// in LOCALE_LABELS. Nothing else needs to change -- detection, persistence,
// and the switcher UI all read from those three.

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import fr from '@/messages/fr.json';
import en from '@/messages/en.json';
import de from '@/messages/de.json';
import it from '@/messages/it.json';
import es from '@/messages/es.json';
import zh from '@/messages/zh.json';
import pt from '@/messages/pt.json';
import ar from '@/messages/ar.json';
import { Operation } from './types';

export type Locale = 'fr' | 'en' | 'de' | 'it' | 'es' | 'zh' | 'pt' | 'ar';

const DICTS: Record<Locale, Record<string, string>> = { fr, en, de, it, es, zh, pt, ar };

/** Every locale the app ships a complete translation for. */
export const SUPPORTED_LOCALES: Locale[] = ['fr', 'en', 'de', 'it', 'es', 'zh', 'pt', 'ar'];

/** Native-language display name, for the switcher UI. */
export const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
  it: 'Italiano',
  es: 'Español',
  zh: '中文',
  pt: 'Português',
  ar: 'العربية',
};

/** Locales read right-to-left; drives <html dir> so text and layout mirror correctly. */
export const RTL_LOCALES: Locale[] = ['ar'];

/** Used server-side (static prerender) and whenever detection can't resolve. */
export const DEFAULT_LOCALE: Locale = 'fr';

const STORAGE_KEY = 'tablomino.locale';

/** Match the browser's preferred languages against what we support, by base
 * language tag (e.g. "en-US" -> "en"), falling back to DEFAULT_LOCALE. */
function detectLocale(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  const prefs =
    navigator.languages && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];
  for (const pref of prefs) {
    const base = pref.split('-')[0].toLowerCase();
    if ((SUPPORTED_LOCALES as string[]).includes(base)) return base as Locale;
  }
  return DEFAULT_LOCALE;
}

export type TParams = Record<string, string | number>;
export type TFunction = (key: string, params?: TParams) => string;

interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: TFunction;
}

const I18nContext = createContext<I18nValue | null>(null);

function interpolate(str: string, params?: TParams): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) =>
    k in params ? String(params[k]) : `{${k}}`,
  );
}

export function I18nProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  /** Pin a locale explicitly (tests, previews). Omit to auto-detect. */
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? DEFAULT_LOCALE);

  // Client-only: an earlier explicit choice always wins; otherwise detect
  // from the browser. Runs after mount (not during render) so the initial
  // client render matches the statically-prerendered (DEFAULT_LOCALE) markup
  // -- no hydration mismatch -- then upgrades in a normal follow-up render.
  useEffect(() => {
    if (initialLocale) return;
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    const resolved =
      stored && (SUPPORTED_LOCALES as string[]).includes(stored)
        ? (stored as Locale)
        : detectLocale();
    // Deliberate: syncing from a browser-only API (localStorage/navigator)
    // must happen after mount, not during the lazy initializer, or it would
    // mismatch the statically-prerendered markup and trigger a hydration error.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocaleState(resolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, l);
  }, []);

  // Keep <html lang>/<html dir> in sync with the active locale -- Arabic
  // needs dir="rtl" for text and layout to read correctly. Note: this only
  // flips text direction and a handful of components that use logical
  // (start/end) Tailwind utilities; most of the app's layout still assumes
  // left-to-right and isn't mirrored, so Arabic reads correctly but the
  // overall page layout isn't a full RTL redesign.
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  const t = useCallback<TFunction>(
    (key, params) => {
      const dict = DICTS[locale];
      const raw = dict[key] ?? DICTS.fr[key] ?? key;
      return interpolate(raw, params);
    },
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

/** Convenience hook returning just the translate function. */
export function useT(): TFunction {
  return useI18n().t;
}

/** Localised operation name via the shared op.* keys. */
export function operationLabel(t: TFunction, op: Operation): string {
  return t(`op.${op}`);
}
