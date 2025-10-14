import { create } from 'zustand';
import type { SolveInput } from '@features/recognize';
import { db } from '@lib/db';

// Define the lightweight metadata structure for UI lists
export interface SolveMetadata {
  id: string;
  question: string;
  timestamp: number;
}

interface SolveStore {
  // State
  solveMetas: SolveMetadata[];
  currentSolveForNav: SolveInput | null; // Used to trigger navigation

  // Actions
  fetchHistory: () => Promise<void>;
  addSolve: (newSolve: SolveInput) => Promise<void>;
  startSolveFromHistory: (id: string) => Promise<void>;
  clearCurrentSolveForNav: () => void;
}

export const useSolveStore = create<SolveStore>((set, get) => ({
  // Initial State
  solveMetas: [],
  currentSolveForNav: null,

  // --- Actions ---

  /**
   * Fetches all solve records from IndexedDB and populates the metadata list for UI.
   * Should be called on app startup.
   */
  fetchHistory: async () => {
    const allSolves = await db.solves.orderBy('timestamp').reverse().toArray();
    // Extract the text from the question object for the metadata
    const metas = allSolves.map(({ id, question, timestamp }) => ({ id, question: (question as any)?.text || question, timestamp }));
    set({ solveMetas: metas });
  },

  /**
   * Adds a new solve record to the database and updates the metadata list.
   */
  addSolve: async (newSolve) => {
    // Ensure timestamp and id are set before saving
    const solveWithMeta = {
      ...newSolve,
      timestamp: newSolve.timestamp || Date.now(),
      id: newSolve.id || newSolve.image.id,
    };

    await db.solves.put(solveWithMeta);

    // Update the UI state with the new metadata, extracting the question text
    const { id, question, timestamp } = solveWithMeta;
    set((state) => ({
      solveMetas: [{ id, question: (question as any)?.text || question, timestamp }, ...state.solveMetas],
    }));
  },

  /**
   * Fetches a full solve record from DB and places it in `currentSolveForNav` to trigger navigation.
   */
  startSolveFromHistory: async (id: string) => {
    const solveRecord = await db.solves.get(id);
    if (solveRecord) {
      set({ currentSolveForNav: solveRecord });
    }
  },

  /**
   * Clears the navigation-triggering state. Should be called after navigation is complete.
   */
  clearCurrentSolveForNav: () => {
    set({ currentSolveForNav: null });
  },
}));