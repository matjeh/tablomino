import type { NextConfig } from "next";
import { CSP } from "./lib/csp";

// BUILD_TARGET=capacitor produces a static export (`out/`) for the native
// Android/iOS apps -- Capacitor's WebView loads bundled local files, not a
// live server, so there's nothing to run `next start` against. The default
// (no env var) build stays exactly as it was: a normal server-rendered
// build, kept for continuity even though the live OVH deploy is now frozen
// as of the SQLite/Capacitor migration (see project notes).
const isCapacitor = process.env.BUILD_TARGET === 'capacitor';

const nextConfig: NextConfig = {
  ...(isCapacitor ? { output: 'export' as const } : {}),
  // Unsupported (silently no-op) under `output: 'export'` -- the Capacitor
  // build's CSP is instead delivered via a <meta> tag in app/layout.tsx.
  async headers() {
    if (isCapacitor) return [];
    return [
      {
        source: '/:path*',
        headers: [{ key: 'Content-Security-Policy', value: CSP }],
      },
    ];
  },
};

export default nextConfig;
