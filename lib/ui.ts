// Shared UI constants: avatar set, Leitner box styling, operation accents.

import { Box, Difficulty, Operation } from './types';

export const AVATARS = ['🦊', '🐼', '🚀', '🦄', '🐙', '🐸', '🦁', '🐳'];

/** Per-avatar accent (badge gradient + card ring) for the player-card design. */
export const AVATAR_ACCENTS: Record<string, { gradient: string; ring: string }> = {
  '🦊': { gradient: 'linear-gradient(135deg,#34d399,#38bdf8)', ring: '#ecfdf5' },
  '🐼': { gradient: 'linear-gradient(135deg,#818cf8,#f0abfc)', ring: '#eff6ff' },
  '🚀': { gradient: 'linear-gradient(135deg,#38bdf8,#818cf8)', ring: '#ecfeff' },
  '🦄': { gradient: 'linear-gradient(135deg,#f0abfc,#f9a8d4)', ring: '#fdf4ff' },
  '🐙': { gradient: 'linear-gradient(135deg,#c084fc,#f472b6)', ring: '#faf5ff' },
  '🐸': { gradient: 'linear-gradient(135deg,#4ade80,#22d3ee)', ring: '#f0fdf4' },
  '🦁': { gradient: 'linear-gradient(135deg,#fbbf24,#fb923c)', ring: '#fffbeb' },
  '🐳': { gradient: 'linear-gradient(135deg,#38bdf8,#22d3ee)', ring: '#ecfeff' },
};

const DEFAULT_ACCENT = { gradient: 'linear-gradient(135deg,#34d399,#38bdf8)', ring: '#ecfdf5' };

export function avatarAccent(avatar: string): { gradient: string; ring: string } {
  return AVATAR_ACCENTS[avatar] ?? DEFAULT_ACCENT;
}

/** Tailwind background classes per Leitner box (matches --color-box-* vars). */
export const BOX_BG: Record<Box, string> = {
  0: 'bg-[var(--color-box-0)]',
  1: 'bg-[var(--color-box-1)]',
  2: 'bg-[var(--color-box-2)]',
  3: 'bg-[var(--color-box-3)]',
};

/** Emoji + accent colour per operation (accent used for headers / buttons). */
export const OPERATION_META: Record<
  Operation,
  { emoji: string; accent: string }
> = {
  multiplication: { emoji: '✖️', accent: 'from-violet-500 to-fuchsia-500' },
  division: { emoji: '➗', accent: 'from-sky-500 to-cyan-500' },
  addition: { emoji: '➕', accent: 'from-emerald-500 to-teal-500' },
  subtraction: { emoji: '➖', accent: 'from-amber-500 to-orange-500' },
};

export const DIFFICULTIES: Difficulty[] = [1, 2, 3];

/** Session length options offered on the config screen. */
export const QUESTION_COUNTS = [5, 10, 20, 50, 100];
