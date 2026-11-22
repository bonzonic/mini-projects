# Blotter practice (wk3 build, started 22 Nov)

Design notes: `blotter-design.md` sections 3 and 5.

## Run
```
npm install
npm run dev
```

## Already set up
- Vite + React 18 + TypeScript + Zustand
- `src/feed.ts`: fake price feed (pretend WebSocket), ~2,000 ticks/sec

## You write
1. `src/store.ts`: `applyBatch` that updates `byId`/`ids` in one `set()`.
2. `src/App.tsx`: buffer + conflate ticks, flush every 200 ms.
3. `src/Grid.tsx` + `src/Row.tsx` (create them): each row subscribes only to its own row (`useBlotter(s => s.byId[id])`), wrapped in `React.memo`.
4. Stretch: green/red flash using `prev` and the `.up` / `.down` classes in index.html.
5. Stretch: swap the plain list for your virtual list from 12 Nov.

## Done when
React DevTools Profiler ("Highlight updates") shows one flush re-renders only the changed rows, not all 2,000.
