'use client';

import { Kalk } from './Kalk';

/**
 * Full-page loading state, reusing the homepage's dark "night panel" look
 * (gradient + dot grid + glow) with Kalk centered, instead of a bare "…".
 * @category Feedback
 */
export function LoadingScreen() {
  return (
    <main
      className="relative flex flex-1 items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(165deg,#1e293b 0%,#312e81 100%)' }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(circle,rgba(52,211,153,0.22) 0%,transparent 62%)' }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.12) 1px,transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />
      <Kalk />
    </main>
  );
}
