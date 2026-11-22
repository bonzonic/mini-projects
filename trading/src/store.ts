import { create } from 'zustand';

// YOUR CODE. Normalized store: one entry per symbol.
export type Row = {
  symbol: string;
  last: number;
  prev: number; // previous price, for the up/down flash
};

type State = {
  byId: Record<string, Row>;
  ids: string[];
  // TODO: an action that applies a whole batch of ticks in ONE set() call
  // applyBatch: (ticks: Tick[]) => void;
};

export const useBlotter = create<State>(() => ({
  byId: {},
  ids: [],
}));
