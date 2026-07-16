import { describe, expect, it } from 'vitest';
import { applyResult } from '@/lib/leitner';
import { BOX_FRAGILE, BOX_KNOWN, BOX_MASTERED, BOX_NEW } from '@/lib/types';
import { makeFact } from './helpers';

describe('leitner applyResult', () => {
  it('promotes after 2 consecutive correct answers', () => {
    let f = makeFact(7, 8, BOX_NEW, 0);
    f = applyResult(f, true);
    expect(f.box).toBe(BOX_NEW); // first correct: not yet promoted
    expect(f.consecutiveCorrect).toBe(1);
    f = applyResult(f, true);
    expect(f.box).toBe(BOX_FRAGILE); // second correct: promoted
    expect(f.consecutiveCorrect).toBe(0);
  });

  it('demotes to fragile on a single error from a higher box', () => {
    const f = applyResult(makeFact(7, 8, BOX_MASTERED), false);
    expect(f.box).toBe(BOX_FRAGILE);
    expect(f.consecutiveCorrect).toBe(0);
  });

  it('keeps a never-seen fact at nouveau on an error (no promotion)', () => {
    const f = applyResult(makeFact(7, 8, BOX_NEW, 0), false);
    expect(f.box).toBe(BOX_NEW);
  });

  it('does not promote beyond mastered', () => {
    let f = makeFact(7, 8, BOX_MASTERED);
    f = applyResult(f, true);
    f = applyResult(f, true);
    f = applyResult(f, true);
    expect(f.box).toBe(BOX_MASTERED);
  });

  it('tracks seen/correct counters', () => {
    let f = makeFact(3, 4, BOX_KNOWN);
    const before = f.timesSeen;
    f = applyResult(f, true);
    f = applyResult(f, false);
    expect(f.timesSeen).toBe(before + 2);
    expect(f.timesCorrect).toBe(f.timesCorrect); // sanity: defined
  });

  it('resets consecutive streak after promotion', () => {
    let f = makeFact(2, 2, BOX_NEW, 0);
    f = applyResult(f, true);
    f = applyResult(f, true); // promoted, streak reset
    f = applyResult(f, true);
    expect(f.consecutiveCorrect).toBe(1);
  });
});
