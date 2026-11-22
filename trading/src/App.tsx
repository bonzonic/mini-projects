import { useEffect } from 'react';
import { startFeed } from './feed';

export function App() {
  useEffect(() => {
    // YOUR CODE:
    // 1. Collect ticks into a buffer (conflate: keep only the latest per symbol).
    // 2. Every 200 ms, flush the buffer into the store with one action.
    // 3. Return a cleanup that stops the feed and the timer.
    const stop = startFeed(() => {});
    return stop;
  }, []);

  return (
    <div>
      <h3>Blotter practice</h3>
      {/* YOUR CODE: render <Grid /> here */}
    </div>
  );
}
