import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Artifact {
  id: string;
  code: string;
  createdAt: number;
  updatedAt: number;
  metadata?: {
    title?: string;
    description?: string;
    libraries?: string[];
  };
}

interface ArtifactStore {
  currentArtifact: Artifact | null;
  artifacts: Artifact[];
  
  // Actions
  createArtifact: (code: string, metadata?: Artifact['metadata']) => string;
  updateArtifact: (id: string, code: string, metadata?: Artifact['metadata']) => void;
  setCurrentArtifact: (id: string) => void;
  getArtifact: (id: string) => Artifact | undefined;
  deleteArtifact: (id: string) => void;
  clearAll: () => void;
}

export const useArtifactStore = create<ArtifactStore>()(
  persist(
    (set, get) => ({
      currentArtifact: null,
      artifacts: [],

      createArtifact: (code, metadata) => {
        const id = `artifact-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const newArtifact: Artifact = {
          id,
          code,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          metadata
        };

        set(state => ({
          artifacts: [...state.artifacts, newArtifact],
          currentArtifact: newArtifact
        }));

        return id;
      },

      updateArtifact: (id, code, metadata) => {
        set(state => ({
          artifacts: state.artifacts.map(a => 
            a.id === id 
              ? { ...a, code, metadata: { ...a.metadata, ...metadata }, updatedAt: Date.now() }
              : a
          ),
          currentArtifact: state.currentArtifact?.id === id
            ? { ...state.currentArtifact, code, metadata: { ...state.currentArtifact.metadata, ...metadata }, updatedAt: Date.now() }
            : state.currentArtifact
        }));
      },

      setCurrentArtifact: (id) => {
        const artifact = get().artifacts.find(a => a.id === id);
        if (artifact) {
          set({ currentArtifact: artifact });
        }
      },

      getArtifact: (id) => {
        return get().artifacts.find(a => a.id === id);
      },

      deleteArtifact: (id) => {
        set(state => ({
          artifacts: state.artifacts.filter(a => a.id !== id),
          currentArtifact: state.currentArtifact?.id === id ? null : state.currentArtifact
        }));
      },

      clearAll: () => {
        set({ artifacts: [], currentArtifact: null });
      }
    }),
    {
      name: 'askgear-artifact-storage',
      partialize: (state) => ({
        artifacts: state.artifacts.slice(-10), // Keep last 10 artifacts
        currentArtifact: state.currentArtifact
      })
    }
  )
);