'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { Button } from './Button';

const CHEERS = [
  '🎉', '🌟', '💥', '🥳', '✨',
  '🏆', '🎯', '🔥', '⭐', '🤩', '😎', '🙌', '👏', '🎇', '🌠',
  '🦋', '🌻', '⚡', '💫', '✅', '👍', '💚', '🔆',
];

/**
 * Positive-reinforcement feedback. Correct = celebratory burst. Wrong =
 * gentle, shows the right answer (no aggressive red). Both offer "continue".
 * @category Feedback
 */
export function FeedbackOverlay({
  state,
  answer,
  onNext,
}: {
  state: 'correct' | 'wrong';
  answer: number;
  onNext: () => void;
}) {
  const t = useT();
  const correct = state === 'correct';
  // Pick once per mount; Math.random in render body is impure.
  const [cheer] = useState(() => CHEERS[Math.floor(Math.random() * CHEERS.length)]);

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div
        className={`text-7xl ${correct ? 'animate-burst' : 'animate-shake'}`}
        aria-hidden
      >
        {correct ? cheer : '🙂'}
      </div>
      <p
        className={`text-2xl font-black ${
          correct ? 'text-emerald-600' : 'text-amber-600'
        }`}
      >
        {correct ? t('game.correct') : t('game.incorrect')}
      </p>
      {!correct && (
        <p className="rounded-2xl bg-amber-50 px-5 py-3 text-xl font-bold text-amber-700 ring-2 ring-amber-100">
          {t('game.theAnswerIs', { answer })}
        </p>
      )}
      <Button onClick={onNext} className="mt-1 w-full max-w-xs">
        {t('game.next')} →
      </Button>
    </div>
  );
}
