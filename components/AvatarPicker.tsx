'use client';

import { AVATARS } from '@/lib/ui';

/** Grid of emoji avatars for picking a player's profile icon. @category Inputs */
export function AvatarPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (avatar: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {AVATARS.map((emoji) => {
        const selected = emoji === value;
        return (
          <button
            key={emoji}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(emoji)}
            className={`flex aspect-square items-center justify-center rounded-2xl text-4xl transition active:scale-95 ${
              selected
                ? 'bg-violet-100 ring-4 ring-violet-400 scale-105'
                : 'bg-white ring-2 ring-slate-200 hover:ring-violet-200'
            }`}
          >
            <span>{emoji}</span>
          </button>
        );
      })}
    </div>
  );
}
