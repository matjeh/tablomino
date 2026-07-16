'use client';

// In-progress game state (config -> jeu -> bilan). Held in a context mounted
// at the app root so it survives client-side navigation without a backend.
//
// Re-injection (spec §3): a wrong answer re-enqueues the same fact a couple of
// questions later. The session ends after `total` answered questions — repeats
// count toward that total.

import { createContext, ReactNode, useContext, useMemo, useReducer } from 'react';
import { applyResult } from './leitner';
import { Fact, Operation, Question, SessionConfig } from './types';

export interface SessionResult {
  score: number;
  total: number;
  operations: Operation[];
  newBadges: string[];
}

type Status = 'idle' | 'playing' | 'finished';

interface State {
  config: SessionConfig | null;
  queue: Question[];
  answered: number;
  total: number;
  facts: Record<string, Fact>; // key `a:b` -> latest Leitner state
  correctCount: number;
  divisionSuccess: boolean;
  status: Status;
  result: SessionResult | null;
}

const initialState: State = {
  config: null,
  queue: [],
  answered: 0,
  total: 0,
  facts: {},
  correctCount: 0,
  divisionSuccess: false,
  status: 'idle',
  result: null,
};

type Action =
  | { type: 'START'; config: SessionConfig; questions: Question[] }
  | { type: 'ANSWER'; correct: boolean }
  | { type: 'SET_RESULT'; result: SessionResult }
  | { type: 'RESET' };

// Must include operation: different operations can share the same (a, b)
// pair — e.g. multiplication 7×8 and addition 7+8 — and would otherwise
// clobber each other's Leitner update within a single mixed-operation
// session. Format is deliberately excluded: direct/hole questions for the
// same fact share one Leitner state, so repeat appearances of a fact (in
// whichever rendered format) must resolve to the same key.
const key = (f: { operation: string; a: number; b: number }) =>
  `${f.operation}:${f.a}:${f.b}`;
const REINJECT_OFFSET = 2;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START':
      return {
        ...initialState,
        config: action.config,
        queue: action.questions,
        total: action.questions.length,
        status: action.questions.length > 0 ? 'playing' : 'finished',
      };

    case 'ANSWER': {
      const current = state.queue[0];
      if (!current || state.status !== 'playing') return state;

      const prev = state.facts[key(current.fact)] ?? current.fact;
      const updated = applyResult(prev, action.correct);
      const facts = { ...state.facts, [key(current.fact)]: updated };

      const answered = state.answered + 1;
      const correctCount = state.correctCount + (action.correct ? 1 : 0);
      const divisionSuccess =
        state.divisionSuccess ||
        (action.correct && current.fact.operation === 'division');

      let queue = state.queue.slice(1);
      if (!action.correct) {
        const at = Math.min(REINJECT_OFFSET, queue.length);
        queue = [...queue.slice(0, at), current, ...queue.slice(at)];
      }

      const finished = answered >= state.total || queue.length === 0;
      return {
        ...state,
        queue,
        answered,
        correctCount,
        divisionSuccess,
        facts,
        status: finished ? 'finished' : 'playing',
      };
    }

    case 'SET_RESULT':
      return { ...state, result: action.result };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

interface SessionValue {
  config: SessionConfig | null;
  current: Question | null;
  answered: number;
  total: number;
  status: Status;
  correctCount: number;
  divisionSuccess: boolean;
  result: SessionResult | null;
  /** Facts touched this session, for persistence. */
  updatedFacts: Fact[];
  start: (config: SessionConfig, questions: Question[]) => void;
  answer: (correct: boolean) => void;
  setResult: (result: SessionResult) => void;
  reset: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

export function ActiveSessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const value = useMemo<SessionValue>(
    () => ({
      config: state.config,
      current: state.queue[0] ?? null,
      answered: state.answered,
      total: state.total,
      status: state.status,
      correctCount: state.correctCount,
      divisionSuccess: state.divisionSuccess,
      result: state.result,
      updatedFacts: Object.values(state.facts),
      start: (config, questions) => dispatch({ type: 'START', config, questions }),
      answer: (correct) => dispatch({ type: 'ANSWER', correct }),
      setResult: (result) => dispatch({ type: 'SET_RESULT', result }),
      reset: () => dispatch({ type: 'RESET' }),
    }),
    [state],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useActiveSession(): SessionValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useActiveSession must be used within ActiveSessionProvider');
  return ctx;
}
