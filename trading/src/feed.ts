// DONE (setup): fake market data feed. ~2,000 ticks/sec across n symbols.
// Pretend this is the WebSocket. Don't change it; build on top of it.
export type Tick = { symbol: string; last: number };

export const SYMBOL_COUNT = 2000;

export function startFeed(onTick: (t: Tick) => void, n = SYMBOL_COUNT) {
  const px = Array.from({ length: n }, () => 100 + Math.random() * 50);
  const id = setInterval(() => {
    for (let k = 0; k < 20; k++) {
      const i = Math.floor(Math.random() * n);
      px[i] += (Math.random() - 0.5) * 0.2;
      onTick({ symbol: `SYM${i}`, last: +px[i].toFixed(2) });
    }
  }, 10);
  return () => clearInterval(id);
}
