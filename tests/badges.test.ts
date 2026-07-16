import { describe, expect, it } from 'vitest';
import { badgeInfo, evaluateBadges } from '@/lib/badges';
import { BOX_MASTERED } from '@/lib/types';
import { makeFact } from './helpers';

function additionCtx(facts: ReturnType<typeof makeFact>[]) {
  for (const f of facts) f.operation = 'addition';
  return {
    operation: 'addition' as const,
    difficulty: 3 as const,
    score: 1,
    total: 1,
    sessionsCompleted: 1,
    hadDivisionSuccess: false,
    facts,
    activityDates: [],
    totalCorrect: 0,
    earned: new Set<string>(),
  };
}

describe('table badges', () => {
  it('multiplication awards a badge per exact row', () => {
    const facts = [7, 8].map((b) => makeFact(6, b, BOX_MASTERED));
    const earned = evaluateBadges({
      operation: 'multiplication',
      difficulty: 3,
      score: 1,
      total: 1,
      sessionsCompleted: 1,
      hadDivisionSuccess: false,
      facts,
      activityDates: [],
      totalCorrect: 0,
      earned: new Set(),
    });
    expect(earned).toContain('table:multiplication:6');
  });

  it('addition groups by the addend\'s last digit, not its exact value', () => {
    // 7 and 17 share the last digit 7 — the digit "table" is only mastered
    // once every fact sharing that digit is mastered, not just one of them.
    const facts = [makeFact(7, 3, BOX_MASTERED), makeFact(17, 4, BOX_MASTERED)];
    const earned = evaluateBadges(additionCtx(facts));
    expect(earned).toContain('table:addition:7');
  });

  it('addition digit table is withheld while any sharing fact is unmastered', () => {
    const facts = [makeFact(7, 3, BOX_MASTERED), makeFact(17, 4, 1)];
    const earned = evaluateBadges(additionCtx(facts));
    expect(earned).not.toContain('table:addition:7');
  });
});

describe('lifetime correct-answer milestones', () => {
  it('awards every milestone reached, not just the highest', () => {
    const earned = evaluateBadges({ ...additionCtx([]), totalCorrect: 1000 });
    expect(earned).toEqual(
      expect.arrayContaining(['correct:100', 'correct:500', 'correct:1000']),
    );
    expect(earned).not.toContain('correct:2000');
  });

  it('does not re-award an already-earned milestone', () => {
    const earned = evaluateBadges({
      ...additionCtx([]),
      totalCorrect: 500,
      earned: new Set(['correct:100']),
    });
    expect(earned).not.toContain('correct:100');
    expect(earned).toContain('correct:500');
  });

  it('badgeInfo resolves the milestone count from the id', () => {
    const info = badgeInfo('correct:5000');
    expect(info.params).toEqual({ count: 5000 });
    expect(info.titleKey).toBe('badge.correctMilestone.title');
  });
});
