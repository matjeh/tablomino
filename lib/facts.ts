// Fact-universe generation: which (a, b) pairs are drilled for a given
// operation + difficulty. Pure, no DB.

import { Difficulty, Operation } from './types';

export interface FactKey {
  a: number;
  b: number;
}

/** Column range shared by multiplication, division, and subtraction "tables". */
const TABLE_B_RANGE = { min: 1, max: 10 };

/** Table (row) range per difficulty for multiplication/division/subtraction. */
const TABLE_RANGE: Record<Difficulty, { min: number; max: number }> = {
  1: { min: 2, max: 5 },
  2: { min: 2, max: 10 },
  3: { min: 2, max: 12 },
};

/** Max sum per difficulty for addition (the only operation without a "table"). */
export const ADD_MAX: Record<Difficulty, number> = {
  1: 10,
  2: 20,
  3: 100,
};

/**
 * Upper bound of the grid for an operation at a difficulty.
 * Used to size the progression grid (rows/cols for mult/div/subtraction).
 */
export function tableRange(difficulty: Difficulty): { min: number; max: number } {
  return TABLE_RANGE[difficulty];
}

function tableKeys(difficulty: Difficulty): FactKey[] {
  const { min, max } = TABLE_RANGE[difficulty];
  const keys: FactKey[] = [];
  for (let a = min; a <= max; a++) {
    for (let b = TABLE_B_RANGE.min; b <= TABLE_B_RANGE.max; b++) {
      keys.push({ a, b });
    }
  }
  return keys;
}

// Addition's own (a, b) space: the two addends, sum <= max. The only operation
// without a row/column "table" structure.
function addKeys(difficulty: Difficulty): FactKey[] {
  const max = ADD_MAX[difficulty];
  const operandCap = max;
  const keys: FactKey[] = [];
  for (let a = 1; a <= operandCap; a++) {
    for (let b = 1; b <= operandCap; b++) {
      if (a + b <= max) keys.push({ a, b });
    }
  }
  return keys;
}

/**
 * All (a, b) fact keys for an operation at a difficulty, optionally filtered
 * to a subset of tables (the "travailler certaines tables" option). Ignored
 * for addition, which has no table concept.
 */
export function universeKeys(
  operation: Operation,
  difficulty: Difficulty,
  targetTables: number[] | null = null,
): FactKey[] {
  let keys: FactKey[];
  switch (operation) {
    case 'multiplication':
    case 'division':
    case 'subtraction':
      keys = tableKeys(difficulty);
      break;
    case 'addition':
      keys = addKeys(difficulty);
      break;
  }
  if (targetTables != null) {
    keys = keys.filter((k) => targetTables.includes(k.a));
  }
  return keys;
}

/** The set of table values (rows) available for this op + difficulty. */
export function availableTables(
  operation: Operation,
  difficulty: Difficulty,
): number[] {
  const seen = new Set<number>();
  for (const k of universeKeys(operation, difficulty)) seen.add(k.a);
  return [...seen].sort((x, y) => x - y);
}

/**
 * "Table" ids for the progression grid/badges. Addition's row range is huge
 * (addends up to ~100), so its table is the addend's last digit (0-9) rather
 * than its exact value — keeps the grid and badge count under control while
 * `tablesMastered` (lib/badges.ts) still requires every real fact sharing
 * that digit to be mastered. Gameplay/difficulty are untouched by this.
 */
export function progressionTables(
  operation: Operation,
  difficulty: Difficulty,
): number[] {
  if (operation === 'addition') return Array.from({ length: 10 }, (_, i) => i);
  return availableTables(operation, difficulty);
}
