# Tablomino

A free app for learning multiplication tables (addition, subtraction, multiplication, division) for kids aged 6 to 11.

**Free. No ads. No trackers. 100% local.**

## About

Tablomino helps children memorize their tables using a spaced repetition system (Leitner method) that automatically adapts the questions asked: facts that aren't yet mastered come back more often, while mastered facts are spaced out further.

No internet connection required after the first load (installable PWA), no data sent to any server, no account needed.

## 🔍 Transparency & privacy — verifiable, not just promised

This project is open source precisely so that this promise doesn't rely on trust alone:

| Promise | How to verify it |
|---|---|
| No trackers / analytics | No analytics dependency in `package.json`. Search for `fetch(`, `XMLHttpRequest`, or `axios` in `app/`, `components/`, `lib/`: the only network call is the service worker's same-origin asset caching (`public/sw.js`). |
| No advertising | No ad SDK in the dependencies. Search for `ads` or `advertising` in `package.json`: no results. |
| No data sent anywhere | All progress (profiles, Leitner scores, badges) is stored locally via IndexedDB — see `lib/db.ts` (schema) and `lib/repo.ts` (data access). There's no backend in this repo. |
| No account required | No authentication flow in the code — no login/auth directory or dependency anywhere in the repo. |

A [CI check](.github/workflows/ci.yml) (`scripts/check-no-tracking.sh`) runs this same
audit automatically on every push, so this table can't silently drift from the code.

If you spot a discrepancy between this table and the actual code, please open an [issue](../../issues) — that's exactly the kind of report this model is meant to enable.

## Tech stack

- Next.js (App Router) — PWA with a service worker for offline functionality
- IndexedDB (Dexie.js) — local storage for profiles and progress
- No backend required for core functionality

## Project status

🚧 Actively in development. Built so far: local multi-profiles, all four
operations with configurable session mix (operation/format/table/question
count), a 4-box spaced-repetition engine, a visual progress grid per
operation, and badges (table mastery, streaks, lifetime milestones). Next up:
an Android release (see [LICENSE](./LICENSE) — same code, packaged as a
Trusted Web Activity).

## Getting started (development)

```bash
git clone https://github.com/matjeh/tablomino.git
cd tablomino
npm install
npm run dev        # start the dev server at http://localhost:3000
```

Other useful scripts:

```bash
npm run build      # production build
npm run start       # run the production build
npm test            # run the test suite (Vitest)
npm run typecheck   # TypeScript check
npm run lint         # ESLint
```

## License

This project is released under the [Apache License 2.0](./LICENSE).

The name "Tablomino" and its associated logo are a trademark protected separately from the code: you're free to fork, modify, and redistribute the code (including for commercial purposes) under the terms of the Apache 2.0 license, but you may not use the "Tablomino" name or associated visuals for a modified version without authorization.

## Contributing

Contributions are welcome — please open an issue before a substantial PR so we can align on the approach together.

## Acknowledgements

- [Geist](https://vercel.com/font) typeface by Vercel, licensed under the SIL Open Font License.
