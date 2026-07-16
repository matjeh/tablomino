'use client';

// Lightweight i18n: flat key dictionaries + a `t()` hook. FR at launch; the
// structure (locale in context, {param} interpolation) is EN-ready.

import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import fr from '@/messages/fr.json';
import en from '@/messages/en.json';
import { Operation } from './types';

export type Locale = 'fr' | 'en';

const DICTS: Record<Locale, Record<string, string>> = { fr, en };

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
  initialLocale = 'fr',
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

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
