import type { NextConfig } from "next";

// Content-Security-Policy: the app is 100% local/offline, so this locks the
// origin down to itself — defense-in-depth against ever accidentally pulling
// in a third-party script/tracker, and hardens the Android TWA's WebView
// (which renders this site full-screen with no browser chrome).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "worker-src 'self'",
  "frame-src 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'Content-Security-Policy', value: CSP }],
      },
    ];
  },
};

export default nextConfig;
