'use client';

import { Box, Fact } from '@/lib/types';
import { BOX_BG } from '@/lib/ui';

/**
 * Grid of facts coloured by Leitner box — "the grid IS the progression".
 * Rows = tables (a), columns = second operand (b).
 * @category Progression
 */
export function PythagoreGrid({
  facts,
  symbol,
}: {
  facts: Fact[];
  symbol: string;
}) {
  const rows = [...new Set(facts.map((f) => f.a))].sort((x, y) => x - y);
  const cols = [...new Set(facts.map((f) => f.b))].sort((x, y) => x - y);
  const boxOf = new Map<string, Box>();
  for (const f of facts) boxOf.set(`${f.a}:${f.b}`, f.box);

  const headCell =
    'flex items-center justify-center text-[0.7rem] font-bold text-slate-400 sm:text-xs';

  return (
    <div className="overflow-x-auto">
      <div
        className="mx-auto grid w-full max-w-xl gap-1 sm:max-w-2xl"
        style={{
          gridTemplateColumns: `1.6rem repeat(${cols.length}, minmax(1.6rem, 1fr))`,
        }}
      >
        <div className={`${headCell} text-slate-300`}>{symbol}</div>
        {cols.map((c) => (
          <div key={`h${c}`} className={headCell}>
            {c}
          </div>
        ))}

        {rows.map((r) => (
          <div key={`row${r}`} className="contents">
            <div className={headCell}>{r}</div>
            {cols.map((c) => {
              const box = boxOf.get(`${r}:${c}`) ?? 0;
              return (
                <div
                  key={`${r}:${c}`}
                  title={`${r} ${symbol} ${c}`}
                  className={`aspect-square rounded-md ${BOX_BG[box]} ${
                    box > 0 ? 'animate-fill' : ''
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
