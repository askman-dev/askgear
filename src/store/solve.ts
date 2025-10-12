import { create } from 'zustand';
import type { SolveInput } from '@features/recognize';

interface SolveStore {
  last?: SolveInput | null;
  set: (input: SolveInput | null) => void;
  clear: () => void;
}

export const useSolveStore = create<SolveStore>((set) => ({
  last: null,
  set: (input) => set({ last: input }),
  clear: () => set({ last: null }),
}));

