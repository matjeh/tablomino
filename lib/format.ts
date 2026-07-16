// Turn a Fact into a renderable Question (prompt string + numeric answer),
// honouring the direct / à-trou format. Pure.

import { Fact, Format, OPERATION_SYMBOL, Question } from './types';

/**
 * The canonical equation `x ∘ y = z` for a fact. Division and subtraction are
 * the inverses of multiplication and addition; `a` is always the table (row),
 * `b` the column, so both read the same way as multiplication:
 *   multiplication: a × b = a*b                  (table × column = result)
 *   division:       (a*b) ÷ a = b                 (dividend ÷ table = column)
 *   addition:       a + b = a+b
 *   subtraction:    (a+b) − a = b                 (minuend − table = column)
 */
export function triple(fact: Fact): { x: number; y: number; z: number; symbol: string } {
  const { a, b, operation } = fact;
  const symbol = OPERATION_SYMBOL[operation];
  switch (operation) {
    case 'multiplication':
      return { x: a, y: b, z: a * b, symbol };
    case 'division':
      return { x: a * b, y: a, z: b, symbol };
    case 'addition':
      return { x: a, y: b, z: a + b, symbol };
    case 'subtraction':
      return { x: a + b, y: a, z: b, symbol };
  }
}

/** Placeholder shown for the blank in a prompt. */
export const BLANK = '?';

type BlankPos = 'result' | 'x' | 'y';

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Build the displayed question for a fact in the given format. For `hole`
 * the blank falls on one of the two operands (chosen via rng); for `direct`
 * it's the result.
 */
export function buildQuestion(
  fact: Fact,
  format: Format = 'direct',
  rng: () => number = Math.random,
): Question {
  const { x, y, z, symbol } = triple(fact);
  const pos: BlankPos = format === 'direct' ? 'result' : pick<BlankPos>(['x', 'y'], rng);

  let prompt: string;
  let answer: number;
  switch (pos) {
    case 'result':
      prompt = `${x} ${symbol} ${y} = ${BLANK}`;
      answer = z;
      break;
    case 'x':
      prompt = `${BLANK} ${symbol} ${y} = ${z}`;
      answer = x;
      break;
    case 'y':
      prompt = `${x} ${symbol} ${BLANK} = ${z}`;
      answer = y;
      break;
  }
  return { fact, prompt, answer };
}
