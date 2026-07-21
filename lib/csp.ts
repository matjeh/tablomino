// Shared CSP directive list. The app is 100% local/offline, so this locks
// the origin down to itself -- defense-in-depth against ever accidentally
// pulling in a third-party script/tracker.
//
// Two delivery mechanisms need this, which is why it's factored out here:
// - next.config.ts's `headers()`, for the server-rendered (non-Capacitor) build.
// - a `<meta http-equiv>` tag in app/layout.tsx, for the Capacitor static
//   export (`headers()` has no effect under `output: 'export'` -- there's no
//   server to emit it). `frame-ancestors` can't be expressed via `<meta>` and
//   is dropped in that variant (see CSP_DIRECTIVES_META) -- low risk since
//   there's no server to be framed inside a Capacitor WebView anyway.
//
// script-src starts with 'unsafe-inline' here as a build-time placeholder --
// scripts/harden-csp.mjs (run as part of `build:capacitor`) replaces it with
// per-page sha256 hashes of Next's actual inline hydration scripts in the
// exported out/*.html, so the shipped Capacitor app never actually ships
// 'unsafe-inline'. The server build has no equivalent per-route post-process
// step, so it keeps 'unsafe-inline' as-is.

export const CSP_DIRECTIVES = [
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
];

export const CSP = CSP_DIRECTIVES.join('; ');

export const CSP_META = CSP_DIRECTIVES.filter((d) => !d.startsWith('frame-ancestors')).join('; ');
