#!/usr/bin/env bash
# Tripwire against silently reintroducing ads/trackers/external network calls.
# Not exhaustive malware scanning — just catches the obvious, common cases.
set -euo pipefail

fail=0

DENYLIST='google-analytics|gtag|dataLayer|sentry|posthog|mixpanel|amplitude|firebase|admob|adsense|@vercel/analytics|segment|hotjar|fullstory|clarity|plausible'

if grep -inE "$DENYLIST" package.json; then
  echo "::error::Found a denylisted tracker/analytics/ads package name in package.json"
  fail=1
fi

if grep -rnE "(fetch|axios|XMLHttpRequest|new WebSocket)\s*\(\s*[\"'\`]https?://" app components lib 2>/dev/null; then
  echo "::error::Found a network call to an external (non-relative) URL in app/, components/, or lib/"
  fail=1
fi

if [ "$fail" -eq 1 ]; then
  echo "check-no-tracking: FAILED — see above."
  exit 1
fi

echo "check-no-tracking: OK — no trackers/ads/external network calls found."
