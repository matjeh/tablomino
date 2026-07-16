import { describe, expect, it } from 'vitest';
import { availableTables, progressionTables, universeKeys } from '@/lib/facts';
import { buildQuestion, triple } from '@/lib/format';
import { buildChoices, distractors } from '@/lib/distractors';
import { makeFact, seeded } from './helpers';

describe('universeKeys', () => {
  it('multiplication level 1 = tables 2-5 × 1-10', () => {
    const keys = universeKeys('multiplication', 1);
    expect(keys).toHaveLength(4 * 10);
    expect(availableTables('multiplication', 1)).toEqual([2, 3, 4, 5]);
  });

  it('multiplication level 3 covers tables 2-12', () => {
    expect(availableTables('multiplication', 3)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('targetTables filters to a subset of rows', () => {
    const keys = universeKeys('multiplication', 3, [7]);
    expect(keys.every((k) => k.a === 7)).toBe(true);
    expect(keys).toHaveLength(10);
  });

  it('subtraction now mirrors multiplication/division tables (not the addition-style range)', () => {
    expect(availableTables('subtraction', 3)).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(availableTables('subtraction', 1)).toEqual([2, 3, 4, 5]);
  });
});

describe('progressionTables', () => {
  it('addition collapses to the 10 last-digit buckets regardless of difficulty', () => {
    expect(progressionTables('addition', 1)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(progressionTables('addition', 3)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('other operations fall back to their real table rows', () => {
    expect(progressionTables('multiplication', 3)).toEqual(availableTables('multiplication', 3));
  });
});

describe('format triple/buildQuestion', () => {
  it('division is the inverse of multiplication (row = divisor, column = quotient)', () => {
    const f = makeFact(6, 7, 0);
    f.operation = 'division';
    const { x, y, z } = triple(f);
    expect(x).toBe(42); // dividend
    expect(y).toBe(6); // divisor (row)
    expect(z).toBe(7); // quotient (column)
  });

  it('subtraction row is the subtracted amount, column is the difference', () => {
    const f = makeFact(7, 8, 0);
    f.operation = 'subtraction';
    const { x, y, z } = triple(f);
    expect(x).toBe(15); // minuend
    expect(y).toBe(7); // subtracted amount (row/table)
    expect(z).toBe(8); // difference (column)
  });

  it('direct format asks for the result', () => {
    const q = buildQuestion(makeFact(7, 8, 0));
    expect(q.answer).toBe(56);
    expect(q.prompt).toContain('7 × 8');
    expect(q.prompt).toContain('?');
  });

  it('hole format asks for a missing operand', () => {
    const f = makeFact(7, 8, 0);
    f.format = 'hole';
    const q = buildQuestion(f, seeded(2));
    expect([7, 8]).toContain(q.answer);
    expect(q.prompt).toContain('56');
  });
});

describe('distractors', () => {
  it('produces n unique, non-negative, wrong values', () => {
    const d = distractors(12, 3, seeded(4));
    expect(d).toHaveLength(3);
    expect(new Set(d).size).toBe(3);
    expect(d.every((v) => v >= 0 && v !== 12)).toBe(true);
  });

  it('buildChoices includes the answer among 4 unique options', () => {
    const choices = buildChoices(9, seeded(8));
    expect(choices).toHaveLength(4);
    expect(choices).toContain(9);
    expect(new Set(choices).size).toBe(4);
  });
});
