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
 * Which side of the equation the table (the `a` operand) lands on, per
 * `triple` above: multiplication/addition put it first, the two inverse
 * operations put it second.
 */
function tableSide(operation: Fact['operation']): BlankPos {
  return operation === 'division' || operation === 'subtraction' ? 'y' : 'x';
}

/**
 * How many tables must be in play before the blank is allowed to fall on the
 * table itself. Below this, `? × 4 = 28` has the same answer every time (the
 * one table the child picked), so they stop computing and just repeat it.
 */
export const MIN_TABLES_FOR_TABLE_BLANK = 3;

/**
 * Build the displayed question for a fact in the given format. For `hole`
 * the blank falls on one of the two operands (chosen via rng); for `direct`
 * it's the result.
 *
 * `tableChoices` is how many tables the session can draw from. When that's
 * small the blank is kept off the table side, otherwise the answer is simply
 * the selected table and the exercise is worthless.
 */
export function buildQuestion(
  fact: Fact,
  format: Format = 'direct',
  rng: () => number = Math.random,
  { tableChoices = Infinity }: { tableChoices?: number } = {},
): Question {
  const { x, y, z, symbol } = triple(fact);
  const sides: BlankPos[] = ['x', 'y'];
  const holeSides =
    tableChoices < MIN_TABLES_FOR_TABLE_BLANK
      ? sides.filter((s) => s !== tableSide(fact.operation))
      : sides;
  const pos: BlankPos = format === 'direct' ? 'result' : pick<BlankPos>(holeSides, rng);

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
