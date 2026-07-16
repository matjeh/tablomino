# Tablomino

Tablomino is a free, offline math-tables practice app for kids (addition,
subtraction, multiplication, division), built as an installable web app (PWA)
and, eventually, a native-feeling Android app via a Trusted Web Activity.
French-first, with an English translation ready to go.

## Key properties

- **100% local** — all progress (profiles, spaced-repetition state, badges)
  is stored on-device in IndexedDB. There is no backend, no account, and no
  data ever leaves the device.
- **No ads, no trackers, no analytics.** Nothing to opt out of, because
  nothing is collected in the first place.
- **Works offline** — installable as a Progressive Web App with a service
  worker; once loaded, no internet connection is required to keep playing.
- **Open source**, licensed under the [Apache License 2.0](./LICENSE).

## How it works

Each child gets a local profile. Practice sessions mix addition, subtraction,
multiplication, and division questions (configurable), and facts are tracked
with a Leitner-style spaced-repetition system (four boxes: new / shaky /
known / mastered) so weaker facts come up more often. Progress is shown as a
fillable grid per operation, alongside badges for milestones (mastering a
table, practice streaks, lifetime correct-answer counts).

## Getting started

```bash
npm install
npm run dev       # start the dev server at http://localhost:3000
```

Other useful scripts:

```bash
npm run build      # production build
npm run start       # run the production build
npm test            # run the test suite (Vitest)
npm run typecheck   # TypeScript check
npm run lint         # ESLint
```

## Contributing

This is a small hobby project. Issues and pull requests are welcome, but
response times may vary.

## Acknowledgements

- [Geist](https://vercel.com/font) typeface by Vercel, licensed under the
  SIL Open Font License.

## License

Apache License 2.0 — see [LICENSE](./LICENSE).
