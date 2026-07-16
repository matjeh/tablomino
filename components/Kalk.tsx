'use client';

/**
 * Kalk, Tablomino's mascot — a small friendly alien. Purely decorative;
 * drawn in CSS (no image asset yet). Keep the ~176×210 box if replacing with
 * an exported SVG/PNG later.
 * @category Feedback
 */
export function Kalk() {
  return (
    <div className="relative h-[210px] w-[176px] animate-kalk-float">
      {/* shadow */}
      <div
        className="absolute bottom-0.5 left-1/2 h-[18px] w-[120px] -translate-x-1/2 rounded-full bg-black/25 blur-[6px]"
      />
      {/* eye stalks, connected to the body */}
      <div
        className="absolute bottom-[150px] left-16 h-10 w-[5px] origin-bottom -rotate-12 bg-emerald-400"
      />
      <div
        className="absolute bottom-[150px] right-16 h-10 w-[5px] origin-bottom rotate-12 bg-emerald-400"
      />
      <div className="absolute -top-2 left-12 grid h-5 w-5 place-items-center rounded-full bg-white">
        <span className="h-[9px] w-[9px] rounded-full bg-slate-900" />
      </div>
      <div className="absolute -top-2 right-12 grid h-5 w-5 place-items-center rounded-full bg-white">
        <span className="h-[9px] w-[9px] rounded-full bg-slate-900" />
      </div>
      {/* drop-shaped body */}
      <div
        className="absolute bottom-[14px] left-1/2 h-[158px] w-[132px] -translate-x-1/2 shadow-[0_14px_28px_rgba(6,78,59,0.5)]"
        style={{
          borderRadius: '50% 50% 44% 44%',
          background: 'linear-gradient(155deg,#6ee7b7,#10b981)',
        }}
      />
      {/* spots */}
      <div className="absolute bottom-[120px] left-11 h-3 w-3 rounded-full bg-emerald-800/45" />
      <div className="absolute bottom-[104px] right-10 h-[9px] w-[9px] rounded-full bg-emerald-800/45" />
      <div className="absolute bottom-12 left-[58px] h-[7px] w-[7px] rounded-full bg-emerald-800/40" />
      {/* glowing antenna */}
      <div className="absolute top-[26px] left-1/2 h-[14px] w-[3px] -translate-x-1/2 bg-emerald-400" />
      <div
        className="absolute top-5 left-1/2 h-[9px] w-[9px] -translate-x-1/2 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.9)]"
      />
      {/* cheeks */}
      <div className="absolute bottom-[70px] left-[38px] h-3 w-5 rounded-full bg-yellow-400/60" />
      <div className="absolute bottom-[70px] right-[38px] h-3 w-5 rounded-full bg-yellow-400/60" />
      {/* central eye */}
      <div
        className="absolute bottom-24 left-1/2 grid h-[58px] w-[58px] -translate-x-1/2 place-items-center rounded-full bg-slate-900 shadow-[inset_0_0_0_4px_#a7f3d0]"
      >
        <span className="relative h-[22px] w-[22px] rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]">
          <span className="absolute top-1 right-1 h-[7px] w-[7px] rounded-full bg-white" />
        </span>
      </div>
      {/* mouth */}
      <div className="absolute bottom-[54px] left-1/2 h-[18px] w-11 -translate-x-1/2 rounded-b-[22px] bg-emerald-900" />
      {/* arms */}
      <div className="absolute bottom-14 left-[14px] h-[58px] w-3 rounded-[7px] bg-emerald-600" />
      <div className="absolute bottom-14 right-[14px] h-[62px] w-3 origin-top rounded-[7px] bg-emerald-600 animate-kalk-wave" />
      {/* flying saucer */}
      <div
        className="absolute top-11 right-0.5 h-4 w-11 rounded-full shadow-[0_0_12px_rgba(250,204,21,0.4)] animate-kalk-float-fast"
        style={{ background: 'linear-gradient(#cbd5e1,#94a3b8)' }}
      >
        <div className="absolute -top-[7px] left-1/2 h-[14px] w-5 -translate-x-1/2 rounded-t-full bg-sky-400/60" />
      </div>
    </div>
  );
}
