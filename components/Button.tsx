'use client';

import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'sm';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30 hover:brightness-105 active:scale-[0.98]',
  secondary:
    'bg-white text-violet-700 ring-2 ring-violet-200 shadow-sm hover:bg-violet-50 active:scale-[0.98]',
  ghost: 'bg-transparent text-slate-500 hover:text-slate-800',
};

const SIZES: Record<Size, string> = {
  md: 'rounded-2xl px-6 py-4 text-lg font-bold',
  sm: 'rounded-xl px-4 py-2.5 text-sm font-bold',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/** Primary call-to-action button, in primary/secondary/ghost variants and md/sm sizes. @category Actions */
export function Button({ variant = 'primary', size = 'md', className = '', ...rest }: Props) {
  return (
    <button
      className={`transition disabled:cursor-not-allowed disabled:opacity-40 ${SIZES[size]} ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  );
}
