'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n';
import { Button } from './Button';

const CHEERS = [
  '🎉', '🌟', '💥', '🥳', '✨',
  '🏆', '🎯', '🔥', '⭐', '🤩', '😎', '🙌', '👏', '🎇', '🌠',
  '🦋', '🌻', '⚡', '💫', '✅', '👍', '💚', '🔆',
];

// Shuffled "bag": draw without replacement, reshuffle once empty. Guarantees
// every cheer is shown once per full cycle (plain Math.random on every mount
// could -- and did -- repeat the same emoji back-to-back). Module-level so
// the bag persists across FeedbackOverlay's remounts each question.
let bag: string[] = [];
let lastCheer: string | null = null;

function drawCheer(): string {
  if (bag.length === 0) {
    bag = [...CHEERS];
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    // The next draw comes from the end (bag.pop()) -- if a fresh shuffle
    // happens to end with the same cheer that just finished the previous
    // bag, swap it away so consecutive draws are never equal.
    if (bag[bag.length - 1] === lastCheer) {
      const swapIndex = Math.floor(Math.random() * (bag.length - 1));
      [bag[bag.length - 1], bag[swapIndex]] = [bag[swapIndex], bag[bag.length - 1]];
    }
  }
  lastCheer = bag.pop()!;
  return lastCheer;
}

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
  // Draw once per mount; Math.random in render body is impure.
  const [cheer] = useState(drawCheer);

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
